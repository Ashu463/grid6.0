import Head from "next/head";
import { useMemo, useState } from "react";
import { CATEGORIES, ENDPOINT_COUNT, PROBES, ProbeResult, Status } from "@/lib/catalog";

const PROBE_COUNT: Record<string, number> = PROBES.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);

const LABEL: Record<Status, string> = {
  pass: "SECURED",
  fail: "GAP FOUND",
  partial: "PARTIAL",
  untested: "NOT APPLICABLE",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Index() {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openProbe, setOpenProbe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const m: Record<string, ProbeResult[]> = {};
    for (const r of results) (m[r.category] ??= []).push(r);
    return m;
  }, [results]);

  const blocked = results.filter((r) => r.pass).length;
  const gotThrough = results.length - blocked;
  const secured = CATEGORIES.filter((c) => status[c.id] === "pass").length;
  const gaps = CATEGORIES.filter((c) => status[c.id] === "fail").length;

  const runTest = async () => {
    if (scanning) return;
    setScanning(true);
    setDone(false);
    setError(null);
    setResults([]);
    setStatus({});
    setOpenCat(null);
    setOpenProbe(null);

    let fresh: ProbeResult[];
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Test failed");
      fresh = json.results as ProbeResult[];
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
      setScanning(false);
      return;
    }

    const grouped: Record<string, ProbeResult[]> = {};
    for (const r of fresh) (grouped[r.category] ??= []).push(r);

    for (const cat of CATEGORIES) {
      const rs = grouped[cat.id] ?? [];
      await sleep(180);
      setResults((prev) => [...prev, ...rs]);
      setStatus((prev) => ({
        ...prev,
        [cat.id]: rs.length === 0 ? "untested" : rs.some((r) => !r.pass) ? "fail" : "pass",
      }));
    }

    setScanning(false);
    setDone(true);
  };

  return (
    <>
      <Head>
        <title>API Security Shield — OWASP API Top 10</title>
        <meta
          name="description"
          content="An e-commerce backend hardened against the OWASP API Top 10, verified by 24 automated attacks."
        />
      </Head>

      <div className="min-h-screen bg-black text-fg antialiased">
        <div className="gridbg pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10">
          {/* ── header ── */}
          <header className="sticky top-0 z-20 border-b border-line/[0.09] bg-black/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-between gap-4 px-6 py-3">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 32 32" fill="none" className="size-[25px] shrink-0">
                  <rect x="3" y="7" width="26" height="22" fill="#FFD200" />
                  <path d="M11 11V8a5 5 0 0 1 10 0v3" stroke="#07070A" strokeWidth="2.2" fill="none" />
                  <text x="16" y="25" fontFamily="IBM Plex Sans" fontSize="13" fontWeight="700" fill="#2874F0" textAnchor="middle">f</text>
                </svg>
                <span className="text-[15px] font-bold">Flipkart</span>
                <span className="font-ox text-[15px] font-extrabold tracking-[0.04em] text-yellow">
                  GRID 6.0
                </span>
              </div>
              <div className="font-mono text-[11px] text-grey">API SECURITY SHIELD</div>
            </div>
          </header>

          <main className="mx-auto max-w-[1040px] px-6">
            {/* ── hero ── */}
            <section className="pb-14 pt-16 sm:pt-20">
              <h1 className="max-w-[19ch] font-ox text-[clamp(32px,5.2vw,58px)] font-extrabold leading-[1.06] tracking-[-0.02em]">
                This backend is hardened against the <span className="text-yellow">OWASP API Top 10</span>.
              </h1>

              <p className="mt-6 max-w-[60ch] text-[16px] leading-relaxed text-[#C2C2CC]">
                {ENDPOINT_COUNT} endpoints, {PROBES.length} automated attacks. Press test — the attacks
                run against my own e-commerce backend and report the status codes it actually returns.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  onClick={runTest}
                  disabled={scanning}
                  className="chamfer-sm bg-yellow px-10 py-4 font-ox text-[15px] font-extrabold tracking-[0.06em] text-black transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100"
                >
                  {scanning ? "TESTING…" : done ? "RUN AGAIN" : "RUN SECURITY TEST"}
                </button>
                <span className="font-mono text-[11.5px] text-grey">
                  {done
                    ? `last run just now · ${blocked} of ${results.length} blocked`
                    : `${PROBES.length} attacks · 10 categories · ~4s`}
                </span>
              </div>

              {error && (
                <div className="chamfer-sm mt-6 max-w-[60ch] bg-red/10 px-4 py-3 font-mono text-[12px] leading-relaxed text-red ring-1 ring-red/30">
                  {error}
                  <div className="mt-1 text-red/70">
                    The backend needs to be running: docker compose up -d
                  </div>
                </div>
              )}

              {/* stat row */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-yellow bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-yellow">{ENDPOINT_COUNT}</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">ENDPOINTS</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-green bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-green">
                    {results.length ? blocked : "—"}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">BLOCKED</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-red bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-red">
                    {results.length ? gotThrough : "—"}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">GOT THROUGH</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-line/20 bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none">149</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">TEST CASES</div>
                </div>
              </div>
            </section>

            {/* ── OWASP results ── */}
            <section className="border-t border-line/[0.09] py-12">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-ox text-[22px] font-bold">OWASP API TOP 10</h2>
                <div className="font-mono text-[11px] text-grey">
                  {scanning
                    ? `running ${PROBES.length} attacks…`
                    : done
                      ? `${secured} secured · ${gaps} gaps · 1 not applicable`
                      : "not yet tested"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {CATEGORIES.map((cat) => {
                  const st = status[cat.id];
                  const probes = byCategory[cat.id] ?? [];
                  const count = PROBE_COUNT[cat.id] ?? 0;
                  const isOpen = openCat === cat.id;

                  const edge =
                    st === "pass"
                      ? "border-l-green"
                      : st === "fail"
                        ? "border-l-red"
                        : st === "untested"
                          ? "border-l-yellow"
                          : "border-l-line/20";

                  const chip =
                    st === "pass"
                      ? "text-green border-green/40 bg-green/10"
                      : st === "fail"
                        ? "text-red border-red/45 bg-red/10"
                        : st === "untested"
                          ? "text-yellow border-yellow/40 bg-yellow/10"
                          : "text-grey border-line/[0.16]";

                  return (
                    <div
                      key={cat.id}
                      className={`border border-line/[0.09] border-l-[3px] ${edge} ${
                        st === "fail" ? "bg-red/[0.045]" : "bg-panel"
                      }`}
                    >
                      <button
                        onClick={() => setOpenCat(isOpen ? null : cat.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-panel2"
                      >
                        <span className="w-[42px] shrink-0 font-mono text-[10.5px] text-grey">
                          {cat.id}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-medium">{cat.title}</span>
                          <span className="mt-0.5 block font-mono text-[10.5px] text-grey">
                            {count === 0 ? "no attacks" : `${count} ${count === 1 ? "attack" : "attacks"}`}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 border px-2.5 py-1.5 font-mono text-[10px] font-semibold ${chip}`}
                        >
                          {st ? LABEL[st] : scanning ? "…" : "NOT RUN"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pl-[58px]">
                          <p className="max-w-[68ch] text-[13.5px] leading-relaxed text-grey">
                            {cat.attack}
                          </p>

                          {probes.length > 0 && (
                            <div className="mt-3.5 space-y-1.5">
                              {probes.map((p) => {
                                const pOpen = openProbe === p.id;
                                return (
                                  <div key={p.id} className="border border-line/[0.09] bg-black/50">
                                    <button
                                      onClick={() => setOpenProbe(pOpen ? null : p.id)}
                                      aria-expanded={pOpen}
                                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-panel2"
                                    >
                                      <span
                                        className={`size-1.5 shrink-0 ${p.pass ? "bg-green" : "bg-red"}`}
                                      />
                                      <span className="min-w-0 flex-1 truncate text-[13px]">
                                        {p.title}
                                      </span>
                                      <span
                                        className={`shrink-0 font-mono text-[12px] font-semibold ${
                                          p.pass ? "text-green" : "text-red"
                                        }`}
                                      >
                                        {p.got}
                                      </span>
                                    </button>

                                    {pOpen && (
                                      <div className="px-3 pb-3">
                                        <div className="border border-line/[0.09]">
                                          <div className="bg-panel2 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.1em] text-grey">
                                            REQUEST SENT
                                          </div>
                                          <pre className="overflow-x-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-[11px] leading-relaxed text-fg/85">
                                            {p.request}
                                          </pre>
                                          <div className="border-y border-line/[0.09] bg-panel2 px-3 py-1.5 font-mono text-[9.5px] tracking-[0.1em] text-grey">
                                            RESPONSE · EXPECTED {p.expected.toUpperCase()}
                                          </div>
                                          <pre
                                            className={`overflow-x-auto whitespace-pre-wrap break-words px-3 py-2 font-mono text-[11px] leading-relaxed ${
                                              p.pass ? "text-green/90" : "text-red/90"
                                            }`}
                                          >
                                            {p.response}
                                          </pre>
                                        </div>
                                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-grey">
                                          {p.note}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {probes.length === 0 && !scanning && (
                            <p className="mt-3 font-mono text-[11px] text-grey">
                              {count === 0
                                ? "No attack written for this category."
                                : "Run the test to see the result."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── footer ── */}
            <footer className="border-t border-line/[0.09] py-8 font-mono text-[11px] leading-relaxed text-grey">
              <div>
                NestJS · Prisma · PostgreSQL · Redis · Docker — attacks execute server-side against the
                running stack.
              </div>
              <div className="mt-1">
                Object-level checks cannot be delegated to a generic scanner: only the application knows
                which record belongs to which user.
              </div>
              <div className="mt-5 border-t border-line/[0.09] pt-5 text-[10.5px] text-grey/70">
                © 2024 Flipkart GRID 6.0 — Information Security
              </div>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
