import Head from "next/head";
import { useMemo, useState } from "react";
import { CATEGORIES, PROBES, ProbeResult, Status } from "@/lib/catalog";

type CatView = {
  id: string;
  title: string;
  probes: number;
  findings: number;
  status: Status;
};

const PROBE_COUNT: Record<string, number> = PROBES.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {} as Record<string, number>);

const INITIAL_CATEGORIES: CatView[] = CATEGORIES.map((c) => ({
  id: c.id,
  title: c.title,
  probes: PROBE_COUNT[c.id] ?? 0,
  findings: 0,
  status: "untested",
}));

const STATUS_LABEL: Record<Status, string> = {
  pass: "PASS",
  fail: "FAIL",
  partial: "PARTIAL",
  untested: "UNTESTED",
};

function statusRing(status: Status) {
  switch (status) {
    case "fail":
      return "ring-fail/40";
    case "partial":
      return "ring-warn/40";
    case "pass":
    case "untested":
    default:
      return "ring-line/60";
  }
}

function statusBadge(status: Status) {
  switch (status) {
    case "pass":
      return "bg-pass/15 text-pass ring-pass/30";
    case "fail":
      return "bg-fail/15 text-fail ring-fail/30";
    case "partial":
      return "bg-warn/15 text-warn ring-warn/30";
    default:
      return "bg-line/40 text-muted ring-line/60";
  }
}

function coverageDotColor(status: Status) {
  switch (status) {
    case "pass":
      return "bg-pass";
    case "fail":
      return "bg-fail";
    case "partial":
      return "bg-warn/70";
    default:
      return "bg-line";
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Index() {
  const [target, setTarget] = useState("http://localhost:9000");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runId, setRunId] = useState("—");
  const [categories, setCategories] = useState<CatView[]>(INITIAL_CATEGORIES);
  const [findings, setFindings] = useState<ProbeResult[]>([]);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [requestsSent, setRequestsSent] = useState(0);
  const [lastProbe, setLastProbe] = useState<string>("—");
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    if (scanning) return;
    setScanning(true);
    setError(null);
    setCategories(INITIAL_CATEGORIES);
    setFindings([]);
    setSelectedFindingId(null);
    setRequestsSent(0);
    setLastProbe("initializing…");
    setProgress(0);

    let results: ProbeResult[];
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Scan failed");
      results = json.results as ProbeResult[];
      setRunId(json.runId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
      setLastProbe("failed");
      setScanning(false);
      return;
    }

    // Reveal results in category order so the console reads as a live run.
    const perCat = new Map<string, ProbeResult[]>();
    for (const r of results) {
      if (!perCat.has(r.category)) perCat.set(r.category, []);
      perCat.get(r.category)!.push(r);
    }

    const order = CATEGORIES.map((c) => c.id);
    for (let i = 0; i < order.length; i++) {
      const catId = order[i];
      const catResults = perCat.get(catId) ?? [];
      await sleep(catResults.length ? 340 : 90);

      const gaps = catResults.filter((r) => !r.pass);
      const status: Status = catResults.length === 0 ? "untested" : gaps.length ? "fail" : "pass";

      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, status, findings: gaps.length } : c)),
      );
      if (gaps.length) {
        setFindings((prev) => {
          const next = [...prev, ...gaps];
          if (!selectedFindingId && !prev.length) setSelectedFindingId(gaps[0].id);
          return next;
        });
      }
      setRequestsSent((n) => n + catResults.length);
      const cat = CATEGORIES.find((c) => c.id === catId);
      setLastProbe(catResults.length ? `${catId} · ${cat?.title.split(" ").slice(0, 2).join(" ")}` : `${catId} · skipped`);
      setProgress(Math.round(((i + 1) / order.length) * 100));
    }

    setScanning(false);
  };

  const verifiedCount = categories.filter((c) => c.status === "pass").length;
  const failCount = categories.filter((c) => c.status === "fail").length;
  const openFindings = findings.length;

  const selectedFinding = useMemo(
    () => findings.find((f) => f.id === selectedFindingId) ?? findings[0] ?? null,
    [findings, selectedFindingId],
  );

  return (
    <>
      <Head>
        <title>Veridian — OWASP API Top 10 scan console</title>
      </Head>
    <div className="min-h-screen bg-ink text-fg antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-1/3 right-[-120px] h-[420px] w-[420px] rounded-full bg-[#1e5f7a]/20 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-fail/5 blur-[120px]" />
      </div>

      <div className="relative">
        {/* control rail */}
        <header className="sticky top-0 z-20 border-b border-line/70 bg-ink/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-[10px] bg-accent/15 ring-1 ring-accent/30">
                <span className="font-mono text-sm font-bold text-accent">V</span>
              </div>
              <div className="leading-none">
                <div className="text-sm font-semibold tracking-tight">Veridian</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  api-audit
                </div>
              </div>
            </div>

            <div className="ml-2 hidden h-8 w-px bg-line/70 sm:block" />

            <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px] bg-surface px-3 py-2 ring-1 ring-line/70 focus-within:ring-accent/50">
              <span className="font-mono text-[11px] text-muted">target</span>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-fg outline-none placeholder:text-muted"
                placeholder="http://localhost:9000"
                spellCheck={false}
              />
            </label>

            <button
              onClick={startScan}
              disabled={scanning}
              className="flex items-center gap-2 rounded-[10px] bg-accent px-3 py-2 text-sm font-semibold text-ink ring-1 ring-accent transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="size-1.5 rounded-full bg-ink/70" />
              {scanning ? "Scanning…" : "Start scan"}
            </button>

            <div className="flex items-center gap-2 rounded-[10px] bg-surface px-3 py-2 ring-1 ring-line/70">
              <span
                className={`size-2 rounded-full ${scanning ? "bg-accent live-dot" : "bg-muted"}`}
              />
              <span className="font-mono text-[11px] text-muted">
                {scanning ? "SCANNING" : progress === 100 ? "COMPLETE" : "IDLE"}
              </span>
              <span className="font-mono text-[11px] text-fg">{progress}%</span>
            </div>
          </div>
          <div className="h-0.5 w-full overflow-hidden bg-surface">
            {scanning ? (
              <div className="scanbar h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent" />
            ) : (
              <div
                className="h-full bg-accent/60 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1180px] px-5 pb-16">
          {error && (
            <div className="mt-6 rounded-[12px] bg-fail/10 px-4 py-3 font-mono text-[12px] text-fail ring-1 ring-fail/30">
              {error}
            </div>
          )}

          {/* summary */}
          <section className="mt-7 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-[14px] bg-surface/60 p-5 ring-1 ring-line/60">
              <div className="flex items-baseline justify-between">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  OWASP API Top 10 — coverage
                </h1>
                <span className="font-mono text-[11px] text-muted">run #{runId}</span>
              </div>
              <div className="mt-5 flex items-end gap-3">
                <span className="text-5xl font-semibold leading-none text-pass">
                  {verifiedCount}
                </span>
                <span className="pb-1 font-mono text-xs text-muted">/ 10 verified</span>
              </div>
              <div className="mt-5 grid grid-cols-10 gap-1">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    title={`${c.id} — ${STATUS_LABEL[c.status]}`}
                    className={`h-2 rounded-full transition-colors ${coverageDotColor(c.status)}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-pass" />
                  verified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-fail" />
                  known-gap
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-warn/70" />
                  partial
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-line" />
                  untested
                </span>
              </div>
            </div>

            <div className="rounded-[14px] bg-surface/60 p-5 ring-1 ring-line/60">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                signal
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-3xl font-semibold leading-none text-fg">{openFindings}</span>
                <span
                  className={`font-mono text-xs ${openFindings > 0 ? "text-fail" : "text-muted"}`}
                >
                  {openFindings === 1 ? "open finding" : "open findings"}
                </span>
              </div>
              <div className="mt-4 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted">requests</span>
                  <span className="text-fg">{requestsSent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">gaps</span>
                  <span className={failCount > 0 ? "text-fail" : "text-fg"}>{failCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">last probe</span>
                  <span className="text-accent truncate max-w-[60%] text-right">{lastProbe}</span>
                </div>
              </div>
            </div>
          </section>

          {/* category matrix */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                Category matrix
              </h2>
              <span className="font-mono text-[11px] text-muted">
                {PROBES.length} probes mapped
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-[12px] bg-surface/50 p-4 ring-1 ${statusRing(c.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] text-muted">{c.id}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ring-1 ${statusBadge(c.status)}`}
                    >
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-medium">{c.title}</div>
                  <div
                    className={`mt-1 font-mono text-[11px] ${c.findings > 0 ? "text-fail" : "text-muted"}`}
                  >
                    {c.findings} {c.findings === 1 ? "finding" : "findings"} · {c.probes} probes
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* findings + evidence */}
          <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
            <div className="rounded-[14px] bg-surface/50 p-2 ring-1 ring-line/60">
              <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Findings · {findings.length}
              </div>
              {findings.length === 0 ? (
                <div className="px-3 py-6 font-mono text-[11px] text-muted">
                  {scanning ? "Probing…" : `No findings yet. Start a scan to probe ${target}.`}
                </div>
              ) : (
                <div className="space-y-1">
                  {findings.map((f) => {
                    const active = selectedFinding?.id === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFindingId(f.id)}
                        className={`stream-in flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left ring-1 transition-colors ${
                          active
                            ? "bg-fail/10 ring-fail/30"
                            : "ring-transparent hover:bg-raised/40"
                        }`}
                      >
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                            f.severity === "HIGH"
                              ? "bg-fail/20 text-fail"
                              : f.severity === "MED"
                                ? "bg-warn/20 text-warn"
                                : "bg-line/40 text-muted"
                          }`}
                        >
                          {f.severity}
                        </span>
                        <span className="font-mono text-xs text-fg truncate">
                          {f.method} {f.path}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-muted">
                          {f.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[14px] bg-ink/60 p-4 ring-1 ring-line/60">
              {selectedFinding ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted">
                      evidence · {selectedFinding.title.toLowerCase()}
                    </span>
                    <span className="font-mono text-[10px] text-fail">reproduced</span>
                  </div>
                  <div className="mt-3 overflow-hidden rounded-[10px] ring-1 ring-line/60">
                    <div className="border-b border-line/60 bg-raised/50 px-3 py-1.5 font-mono text-[10px] text-muted">
                      REQUEST
                    </div>
                    <pre className="overflow-x-auto whitespace-pre px-3 py-2 font-mono text-[11px] leading-relaxed text-fg/90">
                      {selectedFinding.request}
                    </pre>
                    <div className="border-y border-line/60 bg-raised/50 px-3 py-1.5 font-mono text-[10px] text-muted">
                      RESPONSE · got {selectedFinding.got} · expected {selectedFinding.expected}
                    </div>
                    <pre className="overflow-x-auto whitespace-pre px-3 py-2 font-mono text-[11px] leading-relaxed text-fail/90">
                      {selectedFinding.response}
                    </pre>
                  </div>
                  <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
                    <span className="text-fail">note</span> · {selectedFinding.note}
                  </p>
                </>
              ) : (
                <div className="grid h-full min-h-[220px] place-items-center font-mono text-[11px] text-muted">
                  {scanning
                    ? "Running probes…"
                    : "No gaps found, or select a finding to inspect its request/response evidence."}
                </div>
              )}
            </div>
          </section>

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-4 font-mono text-[10px] text-muted">
            <span>backend {target}</span>
            <span>live probes — registers two throwaway accounts and crosses their tokens</span>
          </footer>
        </main>
      </div>
    </div>
    </>
  );
}
