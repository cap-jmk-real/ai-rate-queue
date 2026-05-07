---
name: ai-rate-queue
description: Generate integration snippets for ai-rate-queue (Redis-backed requests-per-minute limiter for AI/LLM API calls). Use when adding shared RPM limiting across multiple Node workers/processes, or when the user mentions rate limiting, Redis throttling, RPM caps, OpenAI/Anthropic limits, or ai-rate-queue.
disable-model-invocation: true
---

# ai-rate-queue

## Quick start

1. Pick an RPM limit (provider/account-specific).
2. Choose a `keyPrefix` that scopes the limit (app + provider + model).
3. Wrap your provider call with `queue.enqueue()`.

## Install

```bash
npm install ai-rate-queue
```

Install a Redis client (example: `ioredis`):

```bash
npm install ioredis
```

## Minimal integration (TypeScript)

```ts
import Redis from "ioredis";
import { createRateLimitQueue } from "ai-rate-queue";

const redis = new Redis(process.env.REDIS_URL!);

const queue = createRateLimitQueue({
  redis,
  requestsPerMinute: 60,
  keyPrefix: "my-app:openai:gpt-4.1"
});

export async function callLLMUnderLimit<T>(fn: () => Promise<T>) {
  return queue.enqueue(fn);
}
```

## Key prefix conventions

Use prefixes that match how limits are applied:

- `my-app:openai:<model>`
- `my-app:anthropic:<model>`
- `my-app:<env>:<provider>:<account>`

## Common pattern: wrap a single call

```ts
const result = await queue.enqueue(async () => {
  // return await client.responses.create(...)
  return { ok: true };
});
```

