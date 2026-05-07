# ai-rate-queue

[![CI](https://shieldcn.dev/github/ci/cap-jmk-real/ai-rate-queue.svg?variant=secondary&style=flat-square&labelColor=171717&color=2ea44f)](https://github.com/cap-jmk-real/ai-rate-queue/actions/workflows/ci.yml)
[![License](https://shieldcn.dev/github/license/cap-jmk-real/ai-rate-queue.svg?variant=secondary&style=flat-square&labelColor=171717&color=22c55e)](LICENSE)
[![Node](https://shieldcn.dev/badge/node-%3E%3D18-339933.svg?logo=node.js&variant=branded&style=flat-square&labelColor=171717)](https://nodejs.org/)
[![TypeScript](https://shieldcn.dev/badge/TypeScript-5.9-3178C6.svg?logo=typescript&variant=branded&style=flat-square&labelColor=171717)](https://www.typescriptlang.org/)

Redis-backed requests-per-minute (RPM) limiter for AI/LLM API calls. Works across multiple workers/processes by sharing counters in Redis.

## Install

```bash
npm install ai-rate-queue
```

Bring your own Redis client (example with `ioredis`):

```bash
npm install ioredis
```

## Usage

```ts
import Redis from "ioredis";
import { createRateLimitQueue } from "ai-rate-queue";

const redis = new Redis(process.env.REDIS_URL!);

const queue = createRateLimitQueue({
  redis,
  requestsPerMinute: 60,
  keyPrefix: "my-app:openai"
});

const result = await queue.enqueue(async () => {
  // call your LLM provider here
  return "ok";
});
```

## Docs

- `docs/quickstart.md`
- `docs/usage.md`
- `docs/redis.md`
- `docs/troubleshooting.md`

