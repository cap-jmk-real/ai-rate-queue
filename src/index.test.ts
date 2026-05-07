import test from "node:test";
import assert from "node:assert/strict";

import { createRateLimitQueue } from "./index.js";

test("createRateLimitQueue throws on invalid RPM", () => {
  assert.throws(
    () =>
      createRateLimitQueue({
        redis: {} as unknown as import("ioredis").Redis,
        requestsPerMinute: 0,
      }),
    /requestsPerMinute must be a positive number/
  );
});

