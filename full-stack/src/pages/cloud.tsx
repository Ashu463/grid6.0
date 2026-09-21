import Head from "next/head";
import TopNav from "@/components/TopNav";
import VpcDiagram from "@/components/VpcDiagram";

const STEPS = [
  {
    t: "Client requests ashuk.ddns.net",
    d: "A dynamic-DNS domain pointed at the EC2 instance's Elastic IP, so the address survives instance restarts.",
  },
  {
    t: "Internet Gateway → EC2, public subnet",
    d: "The VPC's IGW is the only path in. The EC2 instance is the sole host with a route to it.",
  },
  {
    t: "nginx terminates TLS and rate-limits",
    d: "Port 80 redirects to 443. Certificates come from Let's Encrypt via Certbot. Sensitive routes — /auth/login, /auth/register, /orders/:orderId, /payments, /payments/refund, /shipping/estimate — each sit behind their own limit_req zone before the request goes further.",
  },
  {
    t: "Reverse proxy to the NestJS app",
    d: "nginx forwards to the API process on :3000, adding X-Forwarded-* headers so the app sees the real client IP.",
  },
  {
    t: "Prisma → RDS, private subnet",
    d: "PostgreSQL has no public IP and no route from outside the VPC. The EC2 instance is the only thing that can reach it, over the NAT gateway's route table.",
  },
  {
    t: "Logs → CloudWatch, deploys → GitHub Actions",
    d: "Application and access logs ship to CloudWatch. Pushes to master trigger the CI/CD pipeline, which deploys to the EC2 instance over SSH.",
  },
];

const EVIDENCE = [
  {
    k: "VPC & subnets",
    v: "grid6.0-VPCv2.0",
    d: "10.0.0.0/16, 8 subnets split public/private across multiple AZs, 4 route tables, one Internet Gateway, one NAT gateway.",
  },
  {
    k: "Network ACLs",
    v: "5 ports allowed, rest denied",
    d: "Inbound allow-list: 22 (SSH), 80, 443, 9000 (API), 5432 (Postgres) — from 0.0.0.0/0, all else explicitly denied.",
  },
  {
    k: "EC2 instance",
    v: "grid_API_BE · t2.micro",
    d: "Running in the public subnet with a real Elastic IP — confirmed live and reachable during the build recording.",
  },
  {
    k: "TLS",
    v: "Let's Encrypt via Certbot",
    d: "Real certificate on ashuk.ddns.net. HTTP force-redirects to HTTPS; HSTS, X-Frame-Options and nosniff set on every response.",
  },
  {
    k: "Rate limiting",
    v: "7 routes, individually configured",
    d: "Not a single global limiter — separate nginx limit_req zones per sensitive endpoint, verified from the live config file.",
  },
  {
    k: "CI/CD",
    v: "GitHub Actions · Ashu463/grid6.0",
    d: "Real multi-author history — merges from teammates across cartManage, test-cases and reviewManagement branches, not solo commits.",
  },
  {
    k: "Cost",
    v: "$17.24 prior month",
    d: "Pulled from the AWS Cost Explorer widget live in the recording — an actual bill, not a free-tier-only sandbox.",
  },
];

const LIMITS = [
  "nginx was used in place of Kong, which was the original plan.",
  "Prometheus and Grafana didn't fit on the EC2 instance's disk — CloudWatch logging was the fallback.",
  "IP blacklisting and whitelisting were never configured.",
  "A load balancer was scoped out — the added cost wasn't justified for a demo deployment.",
];

export default function Cloud() {
  return (
    <>
      <Head>
        <title>API Security Shield — Cloud Solution</title>
        <meta
          name="description"
          content="The AWS infrastructure built for the original GRID 6.0 submission — VPC, EC2, RDS, TLS and CI/CD, documented with evidence from the build recording."
        />
      </Head>

      <div className="min-h-screen bg-black text-fg antialiased">
        <div className="gridbg pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10">
          <TopNav active="cloud" />

          <main className="mx-auto max-w-[1040px] px-6">
            {/* ── hero ── */}
            <section className="pb-14 pt-16 sm:pt-20">
              <div className="mb-5 inline-flex items-center gap-2 border border-blue/40 bg-blue/10 px-3 py-1.5 font-mono text-[10.5px] font-semibold tracking-[0.08em] text-blue">
                2024 SUBMISSION · NOT LIVE TODAY
              </div>

              <h1 className="max-w-[22ch] font-ox text-[clamp(30px,4.6vw,50px)] font-extrabold leading-[1.1] tracking-[-0.02em]">
                The API also ran inside a <span className="text-yellow">real AWS network</span>, not just Docker on a laptop.
              </h1>

              <p className="mt-6 max-w-[68ch] text-[16px] leading-relaxed text-[#C2C2CC]">
                For the original GRID 6.0 build we put the backend behind a VPC, terminated TLS on a
                real domain, and rate-limited it at the network edge — then decommissioned it after
                judging. Nothing here is clickable, because nothing is running. Every number below
                comes from the build recording: a live console, a live terminal, a real bill.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-blue bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-blue">8</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">SUBNETS</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-yellow bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-yellow">1</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">EC2 INSTANCE</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-green bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none text-green">7</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">ROUTES RATE-LIMITED</div>
                </div>
                <div className="chamfer-sm border border-line/[0.09] border-l-[3px] border-l-line/20 bg-panel px-4 py-4">
                  <div className="font-ox text-[30px] font-bold leading-none">$17.24</div>
                  <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-grey">LAST MONTH&apos;S BILL</div>
                </div>
              </div>
            </section>

            {/* ── architecture ── */}
            <section className="border-t border-line/[0.09] py-12">
              <h2 className="font-ox text-[22px] font-bold">NETWORK ARCHITECTURE</h2>
              <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-grey">
                Public and private subnets inside one VPC. The database never gets a route from
                outside it.
              </p>
              <div className="mt-6 border border-line/[0.09] bg-panel p-5">
                <VpcDiagram />
              </div>
            </section>

            {/* ── data flow ── */}
            <section className="border-t border-line/[0.09] py-12">
              <h2 className="font-ox text-[22px] font-bold">REQUEST PATH</h2>
              <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-grey">
                What actually happens between a browser and the database, in order.
              </p>

              <ol className="mt-6 space-y-2.5">
                {STEPS.map((s, i) => (
                  <li key={s.t} className="flex gap-4 border border-line/[0.09] bg-panel px-4 py-3.5">
                    <span className="shrink-0 font-mono text-[11px] font-bold text-blue">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium">{s.t}</div>
                      <div className="mt-1 text-[12.5px] leading-relaxed text-grey">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── evidence ── */}
            <section className="border-t border-line/[0.09] py-12">
              <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-ox text-[22px] font-bold">BUILD RECORDING</h2>
                <div className="font-mono text-[11px] text-grey">16 min, unedited</div>
              </div>
              <p className="max-w-[70ch] text-[13.5px] leading-relaxed text-grey">
                The recording this whole page is drawn from — the console, the terminal, the config
                files, all of it. Nothing below is a re-enactment.
              </p>

              <div className="mt-6 border border-line/[0.09] bg-panel p-2">
                <video
                  controls
                  preload="none"
                  poster="/build-poster.jpg"
                  className="w-full"
                >
                  <source src="/build-recording.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="mt-8 mb-5 font-mono text-[11px] text-grey">7 details pulled from it, itemized:</div>

              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {EVIDENCE.map((e) => (
                  <div key={e.k} className="border border-line/[0.09] border-l-[3px] border-l-blue bg-panel px-4 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.08em] text-grey">{e.k.toUpperCase()}</span>
                    </div>
                    <div className="mt-1 text-[14.5px] font-semibold text-fg">{e.v}</div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-grey">{e.d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── limitations ── */}
            <section className="border-t border-line/[0.09] py-12">
              <h2 className="font-ox text-[22px] font-bold">WHAT DIDN&apos;T MAKE IT</h2>
              <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed text-grey">
                Stated the same way the OWASP results are — plainly, not hidden in a footnote.
              </p>
              <ul className="mt-6 space-y-2.5">
                {LIMITS.map((l) => (
                  <li key={l} className="flex gap-3 border border-line/[0.09] bg-panel px-4 py-3.5">
                    <span className="mt-[3px] size-1.5 shrink-0 bg-yellow" />
                    <span className="text-[13.5px] leading-relaxed text-grey">{l}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ── status ── */}
            <section className="border-t border-line/[0.09] py-12">
              <div className="border-l-2 border-blue/60 bg-blue/[0.04] px-5 py-4">
                <p className="max-w-[74ch] text-[13.5px] leading-relaxed text-grey">
                  This infrastructure was live and verified during the original build — the VPC, the
                  EC2 instance, and RDS were real, running, and reachable at <span className="text-fg">ashuk.ddns.net</span>.
                  It was decommissioned after judging, and no live instance exists today. The OWASP
                  hardening on the other tab is still verifiable live, right now.
                </p>
              </div>
            </section>

            {/* ── footer ── */}
            <footer className="border-t border-line/[0.09] py-8 font-mono text-[11px] leading-relaxed text-grey">
              <div className="text-[10.5px] text-grey/70">
                © 2024 Flipkart GRID 6.0 — Information Security
              </div>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
