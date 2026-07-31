-- A01 — Review had no owner column, so "only the author can delete their
-- own review" (rm.service.ts deleteReview) was unenforceable. This is a
-- fresh/demo dataset, so a NOT NULL add is safe without a backfill step.
ALTER TABLE "Review" ADD COLUMN "userId" TEXT NOT NULL;
