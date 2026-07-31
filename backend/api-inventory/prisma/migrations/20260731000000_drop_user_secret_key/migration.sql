-- A07/A02 — remove the per-user secretKey column. It backed a JWT-signing
-- pattern where the caller supplied the signing secret, allowing anyone to
-- forge a token for any user. Auth now signs exclusively with the
-- server-managed JWT_SECRET (see src/auth/auth.module.ts).
ALTER TABLE "User" DROP COLUMN "secretKey";
