import { NextRequest } from "next/server";
import { repurposeContent, PLATFORM_LABELS, type Platform } from "@/lib/anthropic";
import { auth } from "@/lib/auth";
import { checkAndConsumeQuota } from "@/lib/db";

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "请先登录" }, { status: 401 });
  }

  const quota = await checkAndConsumeQuota(session.user.id);
  if (!quota.allowed) {
    return Response.json(
      { error: "今日免费额度已用完，请购买套餐后再试" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const content: string = body.content ?? "";
  const platforms: Platform[] = Array.isArray(body.platforms) && body.platforms.length > 0
    ? body.platforms
    : ALL_PLATFORMS;

  if (!content.trim()) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const results = await Promise.all(
    platforms.map(async (platform) => ({
      platform,
      label: PLATFORM_LABELS[platform],
      text: await repurposeContent(content, platform),
    }))
  );

  return Response.json({ results });
}
