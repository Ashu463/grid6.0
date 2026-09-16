export type Status = "pass" | "fail" | "partial" | "untested";
export type Severity = "HIGH" | "MED" | "LOW";

export type ProbeSpec = {
  id: string;
  category: string;
  title: string;
  method: string;
  path: string;
  severity: Severity;
  expected: string;
};

export type ProbeResult = ProbeSpec & {
  pass: boolean;
  got: string;
  request: string;
  response: string;
  note: string;
};

export type ScanEvent =
  | { type: "start"; runId: string }
  | { type: "result"; result: ProbeResult; requests: number }
  | { type: "done"; requests: number }
  | { type: "error"; message: string };

export const CATEGORIES = [
  { id: "API1", title: "Broken Object Level Auth" },
  { id: "API2", title: "Broken Authentication" },
  { id: "API3", title: "Broken Object Property Auth" },
  { id: "API4", title: "Unrestricted Resource Consumption" },
  { id: "API5", title: "Broken Function Level Auth" },
  { id: "API6", title: "Unrestricted Access to Sensitive Flows" },
  { id: "API7", title: "Server Side Request Forgery" },
  { id: "API8", title: "Security Misconfiguration" },
  { id: "API9", title: "Improper Inventory Management" },
  { id: "API10", title: "Unsafe Consumption of APIs" },
];

export const PROBES: ProbeSpec[] = [
  { id: "bola-read-profile", category: "API1", title: "Read another account's profile", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "403" },
  { id: "bola-edit-profile", category: "API1", title: "Edit another account's profile", method: "PUT", path: "/auth/users/:userId", severity: "HIGH", expected: "403" },
  { id: "bola-list-orders", category: "API1", title: "List another account's orders", method: "GET", path: "/orders/user/:userId", severity: "HIGH", expected: "403" },

  { id: "auth-no-token", category: "API2", title: "Call a protected route with no token", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-alg-none", category: "API2", title: "Unsigned token (alg: none)", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-default-secret", category: "API2", title: "Token signed with the documented default secret", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },
  { id: "auth-tampered-sub", category: "API2", title: "Real token with its user id swapped", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "401" },

  { id: "prop-mass-assign", category: "API3", title: "Smuggle a role field into a profile update", method: "PUT", path: "/auth/users/:userId", severity: "HIGH", expected: "400" },
  { id: "prop-password-leak", category: "API3", title: "Password hash in profile response", method: "GET", path: "/auth/users/:userId", severity: "HIGH", expected: "no password field" },

  { id: "rate-login-burst", category: "API4", title: "Password guessing burst", method: "POST", path: "/auth/login ×7", severity: "MED", expected: "429" },
  { id: "rate-rotated-key", category: "API4", title: "Burst with a new x-user-id on every request", method: "POST", path: "/auth/login ×7", severity: "MED", expected: "429" },

  { id: "rbac-delete-product", category: "API5", title: "Delete a product from an ordinary account", method: "DELETE", path: "/products/:id", severity: "HIGH", expected: "403" },
  { id: "rbac-delete-category", category: "API5", title: "Delete a category from an ordinary account", method: "DELETE", path: "/categories/:id", severity: "HIGH", expected: "403" },

  { id: "misconf-headers", category: "API8", title: "Security response headers", method: "GET", path: "/health", severity: "LOW", expected: "nosniff, no x-powered-by" },
  { id: "misconf-cors", category: "API8", title: "CORS for an untrusted origin", method: "GET", path: "/health", severity: "MED", expected: "origin not allowed" },
  { id: "misconf-swagger", category: "API8", title: "API schema reachable without a token", method: "GET", path: "/api-json", severity: "LOW", expected: "404" },
  { id: "misconf-sessions", category: "API8", title: "Session list without a token", method: "GET", path: "/gateway/_sessions", severity: "HIGH", expected: "401" },
];
