# Redis

## Why Redis?

Redis provides a shared counter across processes, so multiple workers can coordinate and respect the same RPM limit.

## Key format

Bucket keys are minute-based:

- `${keyPrefix}:rpm:${floor(Date.now() / 60000)}`

Example:

- `my-app:openai:rpm:29153214`

## Expiry / TTL

Keys expire slightly after the 60s window to avoid unbounded growth.

## Redis client

`ai-rate-queue` expects an [`ioredis`](https://github.com/redis/ioredis) client.

```ts
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL!);
```

## Cluster / managed Redis

Any Redis that supports atomic `INCR`, `DECR`, and `PEXPIRE` works.

