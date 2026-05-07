# Troubleshooting

## Redis connectivity errors

If Redis is down or your network is unstable, `enqueue()` will throw because it cannot safely coordinate the RPM limit.

Suggested mitigations:

- Use a managed Redis with high availability
- Add retries around your *provider call* (not around Redis itself)

## Clock skew

This limiter buckets by the local system clock. If your workers have significant clock skew, they may disagree on the current minute boundary.

Fix:

- Ensure NTP/time sync is enabled on all machines/containers.

## Burstiness (fixed-window behavior)

This is a fixed-window limiter. Near a minute boundary you may observe bursts (many calls right after the window resets).

Mitigations:

- Lower RPM and add per-call backoff in your app if your provider is sensitive
- Use separate `keyPrefix` per workload to smooth spikes

