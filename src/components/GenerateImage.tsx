"use client";

import { useState } from "react";
import { Image as ImageIcon, Loader2, Download, Video } from "lucide-react";
import { IMAGE_MODELS } from "@/lib/models";

interface GenerateImageProps {
  apiKey: string;
  onImageGenerated?: (url: string) => void;
}

export default function GenerateImage({ apiKey, onImageGenerated }: GenerateImageProps) {
  const [model, setModel] = useState<string>("nano-banana-pro");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!apiKey || !prompt) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model, prompt, aspectRatio }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.url);
        onImageGenerated?.(data.url);
      } else {
        setError(data.error);
      }
    } catch {
      setError("요청 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-white">
        <ImageIcon className="w-5 h-5 text-purple-400" />
        <span>이미지 생성</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">모델</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          >
            {Object.entries(IMAGE_MODELS).map(([key, m]) => (
              <option key={key} value={key}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-2">종횡비</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white"
          >
            {["16:9", "4:3", "1:1", "3:4", "9:16"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-2">프롬프트</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="이미지를 설명하세요..."
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 resize-none"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!apiKey || !prompt || loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            생성 중...
          </>
        ) : (
          <>
            <ImageIcon className="w-4 h-4" />
            이미지 생성
          </>
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-zinc-700">
            <img src={result} alt="Generated" className="w-full" />
          </div>
          <div className="flex gap-2">
            <a
              href={result}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              다운로드
            </a>
            <button
              onClick={() => onImageGenerated?.(result)}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
            >
              <Video className="w-4 h-4" />
              영상으로 변환
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
