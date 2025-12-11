"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Film, Loader2, Download, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { IMAGE_TO_VIDEO_MODELS } from "@/lib/models";

export default function ImageToVideoPage() {
  const searchParams = useSearchParams();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState("kling-i2v");
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/apikey/full")
      .then((res) => res.json())
      .then((data) => setApiKey(data.key));
  }, []);

  useEffect(() => {
    const image = searchParams.get("image");
    if (image) {
      setImageUrl(image);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!apiKey || !imageUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate/image-to-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model, imageUrl, prompt, duration }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.url);
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "image-to-video",
            prompt,
            model,
            resultUrl: data.url,
            metadata: { imageUrl, duration },
          }),
        });
      } else {
        setError(data.error);
      }
    } catch {
      setError("요청 실패");
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center p-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400">
            먼저{" "}
            <a href="/dashboard/settings" className="text-purple-400 hover:underline">
              설정
            </a>
            에서 API 키를 설정해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">이미지 → 영상</h1>
        <p className="text-zinc-400">이미지를 움직이는 영상으로 변환합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">모델</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              >
                {Object.entries(IMAGE_TO_VIDEO_MODELS).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">이미지 URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-zinc-700">
                <img src={imageUrl} alt="Preview" className="w-full max-h-48 object-contain bg-zinc-800" />
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-400 mb-2">모션 프롬프트 (선택)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="카메라 움직임, 동작 등을 설명하세요..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 resize-none"
              />
            </div>

            {model === "kling-i2v" && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2">영상 길이 (초)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                >
                  {[3, 5, 10].map((d) => (
                    <option key={d} value={d}>
                      {d}초
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={!imageUrl || loading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  변환 중...
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  영상으로 변환
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-300">
              {error}
            </div>
          )}
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-zinc-700">
                <video src={result} controls className="w-full" />
              </div>
              <a
                href={result}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                다운로드
              </a>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <span className="text-2xl mx-2">→</span>
                <Film className="w-12 h-12 mx-auto mt-2 mb-4 opacity-50" />
                <p>변환된 영상이 여기에 표시됩니다</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
