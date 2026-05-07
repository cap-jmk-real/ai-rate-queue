# AI Rate Queue (OSS) — Design Spec

**Date:** 2026-05-07  
**Project:** `ai-rate-queue` (npm)  
**Repo folder:** `ai-rate-limiting-queue/` (this workspace)

## Goal

Publish a small, app-agnostic **Redis-backed, multi-worker rate-limited queue** for AI/LLM API calls, with:

- A minimal TypeScript API that works in any Node app (workers, API servers, cron jobs).
- Clear docs and examples (Redis-first).
- A project skill under `.cursor/skills/` that helps integrate the library quickly.

## Non-goals

- Browser support
- A full job queue (persistence, retries, dead-letter queues, scheduling, priorities)
- Token-based rate limiting (TPM) in v1

## Package naming + positioning

- **npm name:** `ai-rate-queue` (confirmed available via `npm view` 404 at time of writing)
- **Tagline:** “Redis-backed RPM limiter for AI API calls”

## Public API (v0.1)

Primary export:

- `createRateLimitQueue(config: RateLimitQueueConfig): RateLimitQueue`

Types:

- `RateLimitQueueConfig`
  - `requestsPerMinute: number`
  - `redis: import("ioredis").Redis` (**required** in this Redis-first OSS repo)
  - `keyPrefix?: string` (default: `"ai-rate-queue"`)
- `RateLimitQueue`
  - `enqueue<T>(fn: () => Promise<T>): Promise<T>`

Behavior:

- Global RPM cap across processes by incrementing a per-minute bucket counter in Redis.
- If the cap is exceeded, wait until the next minute boundary (plus small jitter) then retry.
- Keys expire slightly after the minute window to avoid unbounded growth.

## Redis strategy

Mechanism:

- Bucket key: `${keyPrefix}:rpm:${floor(now / 60000)}`
- `INCR` on the bucket key.
- On first increment, set `PEXPIRE` to `(60s + small buffer)`.
- If increment result exceeds `requestsPerMinute`, `DECR` and sleep until the next minute boundary.

Notes:

- This is a simple “fixed-window” limiter (not sliding window). It’s good enough for RPM-style provider limits and easy to reason about.
- The implementation should be safe for multi-worker usage assuming Redis availability.

## Repository structure

- `src/` — library source
- `README.md` — short README with shieldcn badges + quickstart
- `docs/` — detailed usage docs
  - `docs/quickstart.md`
  - `docs/usage.md`
  - `docs/redis.md`
  - `docs/troubleshooting.md`
- `.github/workflows/ci.yml` — build + test on PR/push
- `.cursor/skills/ai-rate-queue/SKILL.md` — integration skill
- `LICENSE` — MIT

## CI + publishing posture

CI:

- `npm ci`
- `npm test`
- `npm run build`

Publishing:

- `package.json` should include `files`, `exports`, `types`, `main`, `repository`, `bugs`, `homepage`, `keywords`, and `license`.
- Build output in `dist/`.

## Documentation requirements

- README: short; focus on install + minimal example + Redis requirement
- Docs: show:
  - Redis-backed multi-worker usage
  - “wrap any async call” pattern
  - keyPrefix guidance for multiple providers/models
  - troubleshooting (clock skew, Redis connectivity, burstiness)

## Cursor skill requirements

Provide a project skill that:

- Generates an integration snippet for Node TypeScript using `ioredis`
- Asks for:
  - RPM value
  - Redis URL vs existing client usage pattern
  - keyPrefix convention
- Emphasizes Redis-first, multi-worker shared limiting

