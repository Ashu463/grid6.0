import type { NextApiRequest, NextApiResponse } from "next";
import { runAll } from "@/lib/runner";
import { ProbeResult } from "@/lib/catalog";
import { SNAPSHOT, SNAPSHOT_DATE } from "@/lib/snapshot";

type Data = {
  results: ProbeResult[];
  live: boolean;
  recordedOn?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ results: [], live: false });
  }

  const target = (req.body?.target as string) || process.env.SCAN_TARGET || "http://localhost:9000";
  const base = target.replace(/\/+$/, "");

  try {
    const results = await runAll(base);
    return res.status(200).json({ results, live: true });
  } catch {
    // The backend only runs locally, so a public deployment can't reach it.
    // Serve the last real run instead — the UI labels it as recorded.
    return res.status(200).json({ results: SNAPSHOT, live: false, recordedOn: SNAPSHOT_DATE });
  }
}
