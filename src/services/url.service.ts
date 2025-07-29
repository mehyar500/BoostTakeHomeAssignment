import { PrismaClient } from "@prisma/client";
import { generateCode } from "../utils/generateCode.js";
import redis from "../infra/cache.js";

const prisma = new PrismaClient();

export const createShortUrl = async (longUrl: string, expiresAt?: Date) => {
  const existing = await prisma.url.findUnique({where: { longUrl }});
  if(existing) return existing;
  return prisma.url.create({data: { longUrl, shortCode: generateCode(), expiresAt}});
}

export const resolveShortCode = async (code: string) => {
  // check cache first
  const cached = await redis.get(code);
  if (cached) return cached;
  // DB lookup
  const url = await prisma.url.findUnique({ where: { shortCode: code } });
  if (!url) throw new Error("Not Found");
  if (url.expiresAt && url.expiresAt < new Date()) throw new Error("Expired");

  // sset cache (fire‑and‑forget)
  redis.set(code, url.longUrl, "EX", +process.env.REDIS_TTL_SECONDS!);

  // analytics bump
  prisma.url.update({
    where: { id: url.id },
    data: { hitCount: { increment: 1 } },
  }).catch(console.error);
  return url.longUrl;
};

export const listUrls = () =>
  prisma.url.findMany({
    orderBy: { createdAt: "desc" }
});
