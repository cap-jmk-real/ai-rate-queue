import { describe, expect, it, vi } from "vitest";

import { createRateLimitQueue } from "./index.js";

describe("createRateLimitQueue", () => {
  it("throws on invalid RPM", () => {
    expect(() =>
      createRateLimitQueue({
        redis: {} as unknown as import("./index.js").RedisLike,
        requestsPerMinute: 0,
      })
    ).toThrow(/requestsPerMinute must be a positive number/);
  });
});

describe("enqueue", () => {
  it("runs work when under limit (and sets expiry on first hit)", async () => {
    const calls: string[] = [];

    const redis = {
      incr: async (_key: string) => 1,
      decr: async (_key: string) => {
        calls.push("decr");
        return 0;
      },
      pexpire: async (_key: string, _ms: number) => {
        calls.push("pexpire");
        return 1;
      },
    } as unknown as import("./index.js").RedisLike;

    const queue = createRateLimitQueue({
      redis,
      requestsPerMinute: 1,
      jitterMs: 0,
      keyPrefix: "t",
    });

    const result = await queue.enqueue(async () => "ok");
    expect(result).toBe("ok");
    expect(calls).toEqual(["pexpire"]);
  });

  it("waits and retries when over limit", async () => {
    const calls: string[] = [];
    const incrResults = [2, 1]; // first attempt over limit, second attempt ok + expiry

    const redis = {
      incr: async (_key: string) => incrResults.shift() ?? 1,
      decr: async (_key: string) => {
        calls.push("decr");
        return 1;
      },
      pexpire: async (_key: string, _ms: number) => {
        calls.push("pexpire");
        return 1;
      },
    } as unknown as import("./index.js").RedisLike;

    vi.useFakeTimers();
    vi.setSystemTime(new Date(60_000));

    const queue = createRateLimitQueue({
      redis,
      requestsPerMinute: 1,
      jitterMs: 0,
      keyPrefix: "t",
    });

    const p = queue.enqueue(async () => "ok");

    // flush the sleep() timer and the retry
    await vi.runAllTimersAsync();

    const result = await p;
    expect(result).toBe("ok");
    expect(calls).toEqual(["decr", "pexpire"]);

    vi.useRealTimers();
  });

  it("uses jitter when configured", async () => {
    const incrResults = [2, 1];

    const redis = {
      incr: async (_key: string) => incrResults.shift() ?? 1,
      decr: async (_key: string) => 1,
      pexpire: async (_key: string, _ms: number) => 1,
    } as unknown as import("./index.js").RedisLike;

    vi.useFakeTimers();
    vi.setSystemTime(new Date(60_000));
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const queue = createRateLimitQueue({
      redis,
      requestsPerMinute: 1,
      jitterMs: 10,
      keyPrefix: "t",
    });

    const p = queue.enqueue(async () => "ok");
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result).toBe("ok");

    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});

