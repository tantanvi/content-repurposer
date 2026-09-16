"use client";

import { useState } from "react";

const PLATFORMS: { key: string; label: string }[] = [
  { key: "xiaohongshu", label: "小红书笔记" },
  { key: "twitter_thread", label: "Twitter/X 线程" },
  { key: "wechat_article", label: "公众号图文" },
  { key: "video_script", label: "短视频口播稿" },
  { key: "zhihu", label: "知乎回答" },
];

type Result = { platform: string; label: string; text: string };

export default function Home() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>(PLATFORMS.map((p) => p.key));
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function togglePlatform(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleGenerate() {
    if (!content.trim() || selected.length === 0) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "生成失败，请重试");
      }
      const data = await res.json();
      setResults(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          内容一键多平台改写
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          粘贴一篇文章或文案，自动改写成小红书、Twitter/X、公众号、短视频口播稿、知乎等平台原生风格版本。
        </p>

        <textarea
          className="mt-6 w-full rounded-lg border border-zinc-300 bg-white p-4 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          rows={10}
          placeholder="粘贴原始内容..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <label
              key={p.key}
              className="flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-black dark:border-zinc-700 dark:text-zinc-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(p.key)}
                onChange={() => togglePlatform(p.key)}
              />
              {p.label}
            </label>
          ))}
        </div>

        <button
          className="mt-6 rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
          onClick={handleGenerate}
          disabled={loading || !content.trim() || selected.length === 0}
        >
          {loading ? "生成中..." : "生成"}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {results && (
          <div className="mt-10 space-y-8">
            {results.map((r) => (
              <div key={r.platform} className="rounded-lg border border-zinc-300 dark:border-zinc-700">
                <div className="flex items-center justify-between border-b border-zinc-300 px-4 py-2 dark:border-zinc-700">
                  <h2 className="text-sm font-semibold text-black dark:text-zinc-50">{r.label}</h2>
                  <button
                    className="text-xs text-zinc-600 underline dark:text-zinc-400"
                    onClick={() => copyText(r.text)}
                  >
                    复制
                  </button>
                </div>
                <pre className="whitespace-pre-wrap p-4 text-sm text-black dark:text-zinc-100">
                  {r.text}
                </pre>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
