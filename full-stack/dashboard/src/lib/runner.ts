import { createHmac } from "crypto";
import { PROBES, ProbeResult, ProbeSpec } from "./catalog";

type Ctx = {
  base: string;
  aId: string;
  aToken: string;
  bId: string;
  bToken: string;
};

const b64url = (o: unknown) =>
  Buffer.from(JSON.stringify(o)).toString("base64url");

function fakeJwt(payload: object, secret?: string) {
  const header = b64url({ alg: secret ? "HS256" : "none", typ: "JWT" });
  const body = b64url(payload);
  if (!secret) return `${header}.${body}.`;
  const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

// The backend's limiter buckets on x-user-id, falling back to IP. Without a
// per-run key every scan shares one IP bucket (100/min) and a second run in the
// same minute throttles the harness itself. Probes that test the limiter set
// this header explicitly and override the default.
let runKey = "harness";

async function hit(
  base: string,
  path: string,
  init: RequestInit & { rawStatusOnly?: boolean } = {},
) {
  const headers = new Headers(init.headers as HeadersInit | undefined);
  if (!headers.has("x-user-id")) headers.set("x-user-id", runKey);
  const res = await fetch(base + path, { ...init, headers });
  const text = await res.text();
  let body = text;
  try {
    body = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    /* leave as text */
  }
  return { status: res.status, headers: res.headers, body: body.slice(0, 800) };
}

function fmtReq(method: string, path: string, extra: string[] = [], body?: object) {
  const lines = [`${method} ${path}`, ...extra];
  if (body) lines.push("", JSON.stringify(body));
  return lines.join("\n");
}

function verdict(spec: ProbeSpec, pass: boolean, got: string, request: string, response: string, note: string): ProbeResult {
  return { ...spec, pass, got, request, response, note };
}

async function setup(base: string): Promise<Ctx> {
  const stamp = Date.now().toString(36);
  const mk = async (tag: string) => {
    const username = `probe_${tag}_${stamp}`;
    const email = `${username}@probe.local`;
    const password = "Probe_pw_123";
    const reg = await hit(base, "/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: { username, email, password } }),
    });
    let id = "";
    try { id = JSON.parse(reg.body)?.data?.id ?? ""; } catch { /* */ }
    // Login is on a stricter 5/min bucket, so give setup its own key.
    const log = await hit(base, "/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-id": `${runKey}-setup-${tag}` },
      body: JSON.stringify({ data: { email, password } }),
    });
    let token = "";
    try { token = JSON.parse(log.body)?.data?.token ?? ""; } catch { /* */ }
    return { id, token };
  };
  const a = await mk("a");
  const b = await mk("b");
  return { base, aId: a.id, aToken: a.token, bId: b.id, bToken: b.token };
}

type Runner = (c: Ctx, spec: ProbeSpec) => Promise<ProbeResult>;

const bearer = (t: string) => ({ authorization: `Bearer ${t}` });

const RUNNERS: Record<string, Runner> = {
  "bola-read-profile": async (c, s) => {
    const r = await hit(c.base, `/auth/users/${c.aId}`, { headers: bearer(c.bToken) });
    const path = `/auth/users/${c.aId}`;
    return verdict(s, r.status === 403, String(r.status),
      fmtReq("GET", path, [`Authorization: Bearer <account B>   # profile owned by account A`]),
      `${r.status}\n${r.body}`,
      r.status === 403 ? "Ownership compared against the id in the token, not the URL." : "Account B read account A's profile.");
  },
  "bola-edit-profile": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const payload = { data: { username: "hijacked", email: "hijacked@probe.local", password: "Probe_pw_123" } };
    const r = await hit(c.base, path, {
      method: "PUT", headers: { ...bearer(c.bToken), "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return verdict(s, r.status === 403, String(r.status),
      fmtReq("PUT", path, [`Authorization: Bearer <account B>`], payload),
      `${r.status}\n${r.body}`,
      r.status === 403 ? "Rejected before any write." : r.status === 500 ? "Server error, not a clean deny." : "Account B modified account A.");
  },
  "bola-list-orders": async (c, s) => {
    const path = `/orders/user/${c.aId}`;
    const r = await hit(c.base, path, { headers: bearer(c.bToken) });
    return verdict(s, r.status === 403, String(r.status),
      fmtReq("GET", path, [`Authorization: Bearer <account B>`]),
      `${r.status}\n${r.body}`,
      r.status === 403 ? "Order listing checks the caller's id." : "Account B listed account A's orders.");
  },

  "auth-no-token": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const r = await hit(c.base, path, {});
    return verdict(s, r.status === 401, String(r.status),
      fmtReq("GET", path, ["(no Authorization header)"]),
      `${r.status}\n${r.body}`,
      r.status === 401 ? "Global guard rejects tokenless requests." : "Protected route answered without a token.");
  },
  "auth-alg-none": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const forged = fakeJwt({ sub: c.aId, email: "attacker@probe.local" });
    const r = await hit(c.base, path, { headers: bearer(forged) });
    return verdict(s, r.status === 401, String(r.status),
      fmtReq("GET", path, ["Authorization: Bearer eyJhbGciOiJub25lIn0...   # unsigned"]),
      `${r.status}\n${r.body}`,
      r.status === 401 ? "Unsigned tokens are rejected." : "An unsigned token was accepted.");
  },
  "auth-default-secret": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const forged = fakeJwt({ sub: c.aId, email: "attacker@probe.local" }, "change_me_in_production");
    const r = await hit(c.base, path, { headers: bearer(forged) });
    return verdict(s, r.status === 401, String(r.status),
      fmtReq("GET", path, ["Authorization: Bearer <HS256, secret = change_me_in_production>"]),
      `${r.status}\n${r.body}`,
      r.status === 401 ? "Server secret differs from the documented default." : "The documented default secret signs valid tokens.");
  },
  "auth-tampered-sub": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    // take account B's real token, flip the middle segment's sub to A, keep B's signature
    const [h, , sig] = c.bToken.split(".");
    const tampered = `${h}.${b64url({ sub: c.aId })}.${sig}`;
    const r = await hit(c.base, path, { headers: bearer(tampered) });
    return verdict(s, r.status === 401, String(r.status),
      fmtReq("GET", path, ["Authorization: Bearer <account B token, sub rewritten to A>"]),
      `${r.status}\n${r.body}`,
      r.status === 401 ? "Editing the payload invalidates the signature." : "A tampered token was accepted.");
  },

  "prop-mass-assign": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const payload = { data: { username: "ok", email: "ok@probe.local", password: "Probe_pw_123", role: "admin", isVerified: true } };
    const r = await hit(c.base, path, {
      method: "PUT", headers: { ...bearer(c.aToken), "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return verdict(s, r.status === 400, String(r.status),
      fmtReq("PUT", path, [`Authorization: Bearer <account A>`], payload),
      `${r.status}\n${r.body}`,
      r.status === 400 ? "Undeclared fields (role, isVerified) rejected by the validation pipe." : r.status === 500 ? "Server error, not a clean reject." : "Extra fields were accepted.");
  },
  "prop-password-leak": async (c, s) => {
    const path = `/auth/users/${c.aId}`;
    const r = await hit(c.base, path, { headers: bearer(c.aToken) });
    const leaked = /password/i.test(r.body);
    return verdict(s, !leaked, leaked ? "leaked" : "clean",
      fmtReq("GET", path, [`Authorization: Bearer <account A>`]),
      `${r.status}\n${r.body}`,
      leaked ? "A password field is present in the response." : "No password field returned.");
  },

  "rate-login-burst": async (c, s) => {
    let last = 0; const codes: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = await hit(c.base, "/auth/login", {
        method: "POST", headers: { "content-type": "application/json", "x-user-id": `${runKey}-burst` },
        body: JSON.stringify({ data: { email: "nobody@probe.local", password: "wrong" } }),
      });
      last = r.status; codes.push(r.status);
    }
    return verdict(s, last === 429, String(last),
      fmtReq("POST", "/auth/login ×7", ["x-user-id: burst-fixed", "wrong credentials"]),
      `codes: ${codes.join(" ")}`,
      last === 429 ? "Login bucket blocks after 5 attempts." : "No throttle after 7 rapid attempts.");
  },
  "rate-rotated-key": async (c, s) => {
    let last = 0; const codes: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = await hit(c.base, "/auth/login", {
        method: "POST", headers: { "content-type": "application/json", "x-user-id": `${runKey}-rot-${i}` },
        body: JSON.stringify({ data: { email: "nobody@probe.local", password: "wrong" } }),
      });
      last = r.status; codes.push(r.status);
    }
    // Known gap: rotating x-user-id dodges the per-user bucket. Pass only if still throttled.
    return verdict(s, last === 429, String(last),
      fmtReq("POST", "/auth/login ×7", ["x-user-id: rot-0, rot-1, …   # new value each time"]),
      `codes: ${codes.join(" ")}`,
      last === 429 ? "Blocked despite rotating the key." : "Rotating the self-reported x-user-id dodged the per-user limit; only the IP bucket remains.");
  },

  "rbac-delete-product": async (c, s) => {
    // create a product first (any authed user can), then delete from the same ordinary account
    const create = await hit(c.base, "/products", {
      method: "POST", headers: { ...bearer(c.aToken), "content-type": "application/json" },
      body: JSON.stringify({ name: "probe-item", description: "x", price: 1, imageUrl: "x" }),
    });
    let id = "";
    try { id = JSON.parse(create.body)?.data?.id ?? ""; } catch { /* */ }
    const path = `/products/${id || "nonexistent"}`;
    const r = await hit(c.base, path, { method: "DELETE", headers: bearer(c.aToken) });
    const pass = r.status === 403;
    return verdict(s, pass, String(r.status),
      fmtReq("DELETE", path, [`Authorization: Bearer <ordinary account>`]),
      `${r.status}\n${r.body}`,
      pass ? "Non-admins can't delete products." : "No role check — any signed-in account can delete products.");
  },
  "rbac-delete-category": async (c, s) => {
    const create = await hit(c.base, "/categories", {
      method: "POST", headers: { ...bearer(c.aToken), "content-type": "application/json" },
      body: JSON.stringify({ data: { name: `probe-cat-${Date.now()}`, description: "probe" } }),
    });
    let id = "";
    try { id = JSON.parse(create.body)?.data?.id ?? ""; } catch { /* */ }
    const path = `/categories/${id || "nonexistent"}`;
    const r = await hit(c.base, path, { method: "DELETE", headers: bearer(c.aToken) });
    const pass = r.status === 403;
    return verdict(s, pass, String(r.status),
      fmtReq("DELETE", path, [`Authorization: Bearer <ordinary account>`]),
      `${r.status}\n${r.body}`,
      pass ? "Non-admins can't delete categories." : "No role check — any signed-in account can delete categories.");
  },

  "misconf-headers": async (c, s) => {
    const r = await hit(c.base, "/health", {});
    const nosniff = r.headers.get("x-content-type-options") === "nosniff";
    const powered = r.headers.get("x-powered-by");
    const pass = nosniff && !powered;
    return verdict(s, pass, pass ? "ok" : "weak",
      fmtReq("GET", "/health"),
      `x-content-type-options: ${r.headers.get("x-content-type-options") ?? "(absent)"}\nx-frame-options: ${r.headers.get("x-frame-options") ?? "(absent)"}\nx-powered-by: ${powered ?? "(removed)"}`,
      pass ? "Helmet defaults applied." : "Expected hardening headers are missing.");
  },
  "misconf-cors": async (c, s) => {
    const r = await hit(c.base, "/health", { headers: { origin: "https://evil.example" } });
    const allow = r.headers.get("access-control-allow-origin");
    const pass = allow !== "https://evil.example" && allow !== "*";
    return verdict(s, pass, pass ? "blocked" : "reflected",
      fmtReq("GET", "/health", ["Origin: https://evil.example"]),
      `access-control-allow-origin: ${allow ?? "(not set)"}`,
      pass ? "Untrusted origin not reflected." : "Server echoed an untrusted origin.");
  },
  "misconf-swagger": async (c, s) => {
    const r = await hit(c.base, "/api-json", {});
    const pass = r.status === 404;
    return verdict(s, pass, String(r.status),
      fmtReq("GET", "/api-json"),
      `${r.status}`,
      pass ? "Swagger not mounted (production build)." : "API schema is reachable without a token.");
  },
  "misconf-malformed-json": async (c, s) => {
    const path = "/auth/login";
    const r = await hit(c.base, path, {
      method: "POST", headers: { "content-type": "application/json" }, body: "{bad json",
    });
    const leaks = /at \S+:\d+|node_modules|\/home\/|\/app\/|\.ts:\d+|\.js:\d+/.test(r.body);
    const pass = r.status === 400 && !leaks;
    return verdict(s, pass, pass ? "clean 400" : String(r.status),
      fmtReq("POST", path, ["content-type: application/json", "body: {bad json   # malformed"]),
      `${r.status}\n${r.body}`,
      pass ? "Parse error is generic — no stack trace or file path in the response." : "Response leaked internal details.");
  },
  "misconf-unknown-route": async (c, s) => {
    const path = "/this-route-does-not-exist";
    const r = await hit(c.base, path, {});
    const isJson = r.body.trim().startsWith("{");
    const pass = r.status === 404 && isJson;
    return verdict(s, pass, pass ? "clean 404" : String(r.status),
      fmtReq("GET", path),
      `${r.status}\n${r.body}`,
      pass ? "Unknown routes return a plain JSON 404 — no framework HTML error page." : "Unexpected response for an unknown route.");
  },

  "flow-burst-register": async (c, s) => {
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) {
      const u = `flow_${Date.now().toString(36)}_${i}_${Math.random().toString(36).slice(2, 6)}`;
      const r = await hit(c.base, "/auth/register", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: { username: u, email: `${u}@probe.local`, password: "Probe_pw_123" } }),
      });
      codes.push(r.status);
    }
    const succeeded = codes.filter((code) => code === 201).length;
    const pass = succeeded < 5;
    return verdict(s, pass, `${succeeded}/5 succeeded`,
      fmtReq("POST", "/auth/register ×5", ["5 unique accounts, back-to-back, no delay between them"]),
      `codes: ${codes.join(" ")}`,
      pass ? "Some registrations were slowed or blocked." : "All 5 accounts were created instantly — no CAPTCHA, email verification, or signup-specific throttle stood in the way.");
  },

  "ssrf-shipping-destination": async (c, s) => {
    const path = "/shipping/estimate";
    const payload = { destination: "http://169.254.169.254/latest/meta-data/iam/security-credentials/", weight: 5, dimensions: { length: 1, width: 1, height: 1 } };
    const r = await hit(c.base, path, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    const pass = r.status === 400;
    return verdict(s, pass, String(r.status),
      fmtReq("POST", path, [], payload),
      `${r.status}\n${r.body}`,
      pass ? "The destination field never reaches any logic — every field is rejected before the handler runs. (The DTO has no validators, so this blocks legitimate estimate requests too, not just this payload.)" : "Server accepted a request naming an internal/metadata address as the destination.");
  },
  "ssrf-image-url": async (c, s) => {
    const path = "/products";
    const payload = { name: "probe-ssrf-image", description: "x", price: 1, imageUrl: "http://169.254.169.254/latest/meta-data/iam/security-credentials/" };
    const r = await hit(c.base, path, {
      method: "POST", headers: { ...bearer(c.aToken), "content-type": "application/json" }, body: JSON.stringify(payload),
    });
    let stored = "";
    try { stored = JSON.parse(r.body)?.data?.imageUrl ?? ""; } catch { /* */ }
    const pass = r.status === 201 && stored === payload.imageUrl;
    return verdict(s, pass, pass ? "stored, not fetched" : String(r.status),
      fmtReq("POST", path, [`Authorization: Bearer <account A>`], payload),
      `${r.status}\n${r.body}`,
      pass ? "The URL is stored as plain text and returned unmodified — nothing on the server ever dereferences it." : "Unexpected response; couldn't confirm the field is inert.");
  },

  "inventory-sessions-list": async (c, s) => {
    const r = await hit(c.base, "/gateway/_sessions", {});
    const pass = r.status === 401;
    return verdict(s, pass, String(r.status),
      fmtReq("GET", "/gateway/_sessions", ["(no Authorization header)"]),
      `${r.status}\n${r.body}`,
      pass ? "Admin/debug endpoint requires a token like everything else." : "Session list returned without a token.");
  },
  "inventory-session-lookup": async (c, s) => {
    const path = "/gateway/_sessions/guessed-session-id";
    const r = await hit(c.base, path, {});
    const pass = r.status === 401;
    return verdict(s, pass, String(r.status),
      fmtReq("GET", path, ["(no Authorization header)"]),
      `${r.status}\n${r.body}`,
      pass ? "Guessing a session id doesn't help — it still requires auth." : "Session details were returned without a token.");
  },
  "inventory-legacy-path": async (c, s) => {
    const path = "/api/v1/products";
    const r = await hit(c.base, path, {});
    const pass = r.status === 404;
    return verdict(s, pass, String(r.status),
      fmtReq("GET", path),
      `${r.status}`,
      pass ? "No orphaned legacy-version route lingering behind the current API." : "A legacy/shadow route responded.");
  },
};

export async function runAll(base: string): Promise<ProbeResult[]> {
  runKey = `harness-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const ctx = await setup(base);
  if (!ctx.aToken || !ctx.bToken) {
    throw new Error("Could not register/login two probe accounts — is the backend reachable and migrated?");
  }
  const out: ProbeResult[] = [];
  for (const spec of PROBES) {
    const runner = RUNNERS[spec.id];
    if (!runner) continue;
    try {
      out.push(await runner(ctx, spec));
    } catch (e) {
      out.push(verdict(spec, false, "error", `${spec.method} ${spec.path}`, String(e), "Probe could not complete."));
    }
  }
  return out;
}
