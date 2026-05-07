# Usage

`ai-rate-queue` is intentionally tiny: you provide a shared Redis client and an RPM cap, then run any async work via `enqueue()`.

## Wrap a provider call

```ts
import Redis from "ioredis";
import { createRateLimitQueue } from "ai-rate-queue";

const redis = new Redis(process.env.REDIS_URL!);

const openaiQueue = createRateLimitQueue({
  redis,
  requestsPerMinute: 60,
  keyPrefix: "my-app:openai"
});

export async function callOpenAI() {
  return openaiQueue.enqueue(async () => {
    // return await openai.responses.create(...)
    return { ok: true };
  });
}
```

## Multiple queues (recommended)

Use separate `keyPrefix` values when limits differ by provider, model, account, or environment:

- `my-app:openai:gpt-4.1`
- `my-app:anthropic:claude-3.7`
- `my-app:demo`

```ts
const qA = createRateLimitQueue({ redis, requestsPerMinute: 60, keyPrefix: "my-app:openai:gpt" });
const qB = createRateLimitQueue({ redis, requestsPerMinute: 30, keyPrefix: "my-app:anthropic:sonnet" });
```

## Concurrency notes

- `enqueue()` does not serialize work; it only gates entry under the RPM cap.
- If you run many concurrent tasks, they may all wake up near the next minute boundary. Consider staggering callers or using multiple queues when appropriate.

