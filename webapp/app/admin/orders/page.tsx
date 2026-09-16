import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

// 极简人工核销后台：仅通过环境变量里的密码保护，不做完整权限系统
function isAuthorized(providedKey: string | undefined) {
  return !!process.env.ADMIN_KEY && providedKey === process.env.ADMIN_KEY;
}

async function approveOrder(orderId: string, adminKey: string) {
  "use server";
  if (!isAuthorized(adminKey)) throw new Error("unauthorized");

  const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  const now = new Date();

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paidAt: now,
      expiresAt: order.packageType === "monthly"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null,
      remainingCount: order.packageType === "pack100" ? 100 : null,
    },
  });

  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (!isAuthorized(key)) return notFound();

  const pendingOrders = await prisma.order.findMany({
    where: { status: "pending" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">待核销订单</h1>
      <div className="mt-6 space-y-4">
        {pendingOrders.length === 0 && (
          <p className="text-sm text-zinc-500">没有待核销订单。</p>
        )}
        {pendingOrders.map((order) => (
          <div key={order.id} className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
            <p className="text-sm text-black dark:text-zinc-50">
              {order.user.email} — {order.packageType} — ¥{(order.amount / 100).toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-zinc-500">备注码: {order.remitNote}</p>
            <form
              action={async () => {
                await approveOrder(order.id, key!);
              }}
              className="mt-2"
            >
              <button
                type="submit"
                className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black"
              >
                标记已付款
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
