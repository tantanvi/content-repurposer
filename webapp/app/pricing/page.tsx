import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

const PACKAGES = [
  { type: "monthly", label: "月卡（30天不限次）", amount: 2900 },
  { type: "pack100", label: "次数包（100次改写）", amount: 1900 },
] as const;

async function createOrder(packageType: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const remitNote = randomBytes(3).toString("hex").toUpperCase();
  await prisma.order.create({
    data: {
      userId: session.user!.id!,
      packageType,
      amount,
      remitNote,
    },
  });
  redirect("/pricing?ordered=1");
}

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">购买套餐</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        当前处于人工核销阶段：下单后按提示转账并备注专属码，我们会尽快为你手动开通。
      </p>

      {!session?.user && (
        <p className="mt-6 text-sm text-red-600">请先 <a href="/login" className="underline">登录</a> 后再购买。</p>
      )}

      <div className="mt-8 space-y-6">
        {PACKAGES.map((pkg) => (
          <div key={pkg.type} className="rounded-lg border border-zinc-300 p-6 dark:border-zinc-700">
            <h2 className="text-lg font-medium text-black dark:text-zinc-50">{pkg.label}</h2>
            <p className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
              ¥{(pkg.amount / 100).toFixed(0)}
            </p>
            <form
              action={async () => {
                "use server";
                await createOrder(pkg.type, pkg.amount);
              }}
              className="mt-4"
            >
              <button
                type="submit"
                disabled={!session?.user}
                className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
              >
                购买
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
        <p className="font-medium text-black dark:text-zinc-50">如何完成付款</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>点击上方"购买"生成订单。</li>
          <li>扫描下方微信/支付宝收款码，转账对应金额。</li>
          <li>转账备注填写你的订单专属码（下单后在"我的订单"页可查看）。</li>
          <li>我们收到转账后会在24小时内为你手动开通，开通后即可在首页使用。</li>
        </ol>
        <p className="mt-4 text-xs text-zinc-500">
          [收款码占位图 — 替换为你自己的微信/支付宝收款码图片]
        </p>
      </div>
    </div>
  );
}
