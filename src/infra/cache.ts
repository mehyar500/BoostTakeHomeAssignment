import Redis from "ioredis";

// Cast to `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redis = new (Redis as any)(process.env.REDIS_URL ?? "redis://redis:6379");
export default redis;
