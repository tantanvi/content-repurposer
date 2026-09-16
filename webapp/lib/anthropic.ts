import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic();

const PROMPTS_DIR = path.join(process.cwd(), "lib", "prompts");

export type Platform = "xiaohongshu" | "twitter_thread" | "wechat_article" | "video_script" | "zhihu";

export const PLATFORM_LABELS: Record<Platform, string> = {
  xiaohongshu: "小红书笔记",
  twitter_thread: "Twitter/X 线程",
  wechat_article: "公众号图文",
  video_script: "短视频口播稿",
  zhihu: "知乎回答",
};

function loadStyleGuide(platform: Platform): string {
  return fs.readFileSync(path.join(PROMPTS_DIR, `${platform}.md`), "utf-8");
}

export async function repurposeContent(content: string, platform: Platform): Promise<string> {
  const styleGuide = loadStyleGuide(platform);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4096,
    system: `你是一个内容改写助手。根据下面的平台风格指南，把用户提供的原始内容改写成该平台的原生风格版本。忠实于原文事实，不编造数据、案例或引用。\n\n${styleGuide}`,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text : "";
}
