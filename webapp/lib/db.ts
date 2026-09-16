import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const FREE_DAILY_LIMIT = 3;

export type QuotaCheck =
  | { allowed: true; reason: "free" | "monthly" | "pack100" }
  | { allowed: false; reason: "free_limit_reached" };

export async function checkAndConsumeQuota(userId: string): Promise<QuotaCheck> {
  const now = new Date();

  const activeMonthly = await prisma.order.findFirst({
    where: { userId, packageType: "monthly", status: "paid", expiresAt: { gt: now } },
  });
  if (activeMonthly) {
    return { allowed: true, reason: "monthly" };
  }

  const activePack = await prisma.order.findFirst({
    where: { userId, packageType: "pack100", status: "paid", remainingCount: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });
  if (activePack) {
    await prisma.order.update({
      where: { id: activePack.id },
      data: { remainingCount: { decrement: 1 } },
    });
    return { allowed: true, reason: "pack100" };
  }

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const usedToday = await prisma.usageLog.count({
    where: { userId, createdAt: { gte: todayStart } },
  });
  if (usedToday >= FREE_DAILY_LIMIT) {
    return { allowed: false, reason: "free_limit_reached" };
  }

  await prisma.usageLog.create({ data: { userId } });
  return { allowed: true, reason: "free" };
}
