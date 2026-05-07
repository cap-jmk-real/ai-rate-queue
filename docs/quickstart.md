# Quickstart

## Install

```bash
npm install ai-rate-queue
```

Install a Redis client (example: `ioredis`):

```bash
npm install ioredis
```

## Minimal example

```ts
import Redis from "ioredis";
import { createRateLimitQueue } from "ai-rate-queue";

const redis = new Redis(process.env.REDIS_URL!);

const queue = createRateLimitQueue({
  redis,
  requestsPerMinute: 60,
  keyPrefix: "my-app:llm"
});

export async function callUnderLimit<T>(fn: () => Promise<T>) {
  return queue.enqueue(fn);
}
```

## Environment

Set:

- `REDIS_URL` (example: `redis://localhost:6379`)

