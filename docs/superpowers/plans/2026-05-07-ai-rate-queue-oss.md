# AI Rate Queue (OSS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `ai-rate-queue`, a Redis-backed RPM limiter for AI/LLM API calls, with short README, detailed docs, CI, and a project Cursor skill.

**Architecture:** A small TypeScript library exporting `createRateLimitQueue({ requestsPerMinute, redis, keyPrefix? })` and `queue.enqueue(asyncFn)`. Uses Redis `INCR` in fixed 60s buckets with expiry; waits until next minute when limit exceeded.

**Tech Stack:** Node.js (>=18), TypeScript, `ioredis` (peer dependency), GitHub Actions.

---

## File structure (create/modify)

**Create:**
- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `README.md`
- `LICENSE`
- `docs/quickstart.md`
- `docs/usage.md`
- `docs/redis.md`
- `docs/troubleshooting.md`
- `.github/workflows/ci.yml`
- `.gitignore`
- `.cursor/skills/ai-rate-queue/SKILL.md`

**Keep:**
- `docs/superpowers/specs/2026-05-07-ai-rate-queue-oss-design.md`

## Task 1: Initialize repository + package metadata

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `LICENSE`

- [ ] **Step 1: Initialize git repo and set branch to `main`**

Run:

```bash
git init
git checkout -b main
```

Expected: repository initialized, current branch `main`.

- [ ] **Step 2: Create `LICENSE` (MIT)**

Create `LICENSE` with standard MIT text and `Copyright (c) 2026`.

- [ ] **Step 3: Create `.gitignore`**

Include:
- `node_modules/`
- `dist/`
- `.DS_Store`
- `*.log`
- `.env`

- [ ] **Step 4: Create `package.json` suitable for npm publish**

Create `package.json`:

```json
{
  "name": "ai-rate-queue",
  "version": "0.1.0",
  "description": "Redis-backed requests-per-minute limiter for AI/LLM API calls.",
  "license": "MIT",
  "author": "",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/<REPLACE_ME>/ai-rate-queue.git"
  },
  "bugs": {
    "url": "https://github.com/<REPLACE_ME>/ai-rate-queue/issues"
  },
  "homepage": "https://github.com/<REPLACE_ME>/ai-rate-queue#readme",
  "keywords": ["rate-limit", "queue", "redis", "openai", "anthropic", "llm"],
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "node --test dist/**/*.test.js",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "ioredis": "^5.10.0"
  },
  "peerDependenciesMeta": {
    "ioredis": { "optional": false }
  },
  "devDependencies": {
    "@types/node": "^22.19.0",
    "ioredis": "^5.10.0",
    "typescript": "^5.9.0"
  },
  "engines": {
    "node": ">=18"
  }
}
```

Note: keep `<REPLACE_ME>` placeholders for now; README/docs will avoid hard-linking until you set the repo URL.

## Task 2: Add TypeScript build config + library implementation

**Files:**
- Create: `tsconfig.json`
- Create: `src/index.ts`

- [ ] **Step 1: Create `tsconfig.json`**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2: Implement `src/index.ts` (Redis-first)**

Create `src/index.ts` based on existing implementation:
- require `redis` in config (no in-memory mode in this OSS repo)
- keep `keyPrefix` default `ai-rate-queue`
- keep fixed-window behavior + expiry buffer
- add small jitter in wait to reduce thundering herd

- [ ] **Step 3: Build**

Run:

```bash
npm install
npm run build
```

Expected: `dist/index.js` and `dist/index.d.ts` generated.

## Task 3: README (short) + docs (detailed)

**Files:**
- Create: `README.md`
- Create: `docs/quickstart.md`
- Create: `docs/usage.md`
- Create: `docs/redis.md`
- Create: `docs/troubleshooting.md`

- [ ] **Step 1: Write `README.md`**

Short README:
- project title
- shieldcn badges (License, Node, TypeScript, npm version placeholder optional, CI badge once workflow exists)
- 30-second install snippet
- minimal usage example with `ioredis`
- link to `docs/`

- [ ] **Step 2: Write docs pages**

Write:
- `docs/quickstart.md`: install + minimal example + required env vars
- `docs/usage.md`: patterns (wrapping client calls, multiple queues per provider/model), concurrency notes
- `docs/redis.md`: connection config, keyPrefix, TTL/expiry, cluster notes
- `docs/troubleshooting.md`: clock skew, Redis errors, burstiness and fixed-window behavior

## Task 4: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Add CI**

Workflow:
- triggers on push + PR
- uses `actions/setup-node` (Node 18/20/22 matrix)
- `npm ci`
- `npm test` (after build)
- `npm run build`

## Task 5: Project Cursor skill

**Files:**
- Create: `.cursor/skills/ai-rate-queue/SKILL.md`

- [ ] **Step 1: Create skill**

`SKILL.md` should:
- have YAML frontmatter with `name: ai-rate-queue`
- describe when to use (integrating Redis-backed RPM limiter)
- include copy/paste examples:
  - create redis client
  - create queue with rpm + keyPrefix
  - wrap an async function with `enqueue`
- keep under 500 lines; keep it practical

## Task 6: Verification

- [ ] **Step 1: Run local checks**

Run:

```bash
npm run build
npm test
```

Expected: build succeeds; tests succeed (if no tests exist, `npm test` should still succeed—either provide a minimal test or adjust the script).

- [ ] **Step 2: Quick “publish dry run” sanity**

Run:

```bash
npm pack --dry-run
```

Expected: tarball includes `dist/`, `README.md`, `LICENSE`, and excludes `src/` if desired (fine either way).

