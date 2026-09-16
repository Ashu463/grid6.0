import type { NextApiRequest, NextApiResponse } from "next";
import { runAll } from "@/lib/runner";
import { ProbeResult } from "@/lib/catalog";

type Data = { runId: string; results: ProbeResult[] } | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const target = (req.body?.target as string) || process.env.SCAN_TARGET || "http://localhost:9000";
  const base = target.replace(/\/+$/, "");

  try {
    const results = await runAll(base);
    return res.status(200).json({ runId: Date.now().toString(36), results });
  } catch (e) {
    return res.status(502).json({ error: e instanceof Error ? e.message : "Scan failed" });
  }
}
