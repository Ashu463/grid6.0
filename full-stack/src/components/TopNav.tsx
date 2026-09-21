import Link from "next/link";

export default function TopNav({ active }: { active: "backend" | "cloud" }) {
  return (
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

        <nav className="flex items-center border border-line/[0.14] bg-panel p-1" aria-label="Solution">
          <Link
            href="/"
            className={`px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors ${
              active === "backend" ? "bg-yellow text-black" : "text-grey hover:text-fg"
            }`}
          >
            BACKEND SOLUTION
          </Link>
          <Link
            href="/cloud"
            className={`px-4 py-1.5 font-mono text-[11px] font-semibold tracking-[0.06em] transition-colors ${
              active === "cloud" ? "bg-yellow text-black" : "text-grey hover:text-fg"
            }`}
          >
            CLOUD SOLUTION
          </Link>
        </nav>
      </div>
    </header>
  );
}
