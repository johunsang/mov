"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2, Download, Video, Save, Sparkles } from "lucide-react";
import { IMAGE_MODELS } from "@/lib/models";

export default function ImagePage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState("nano-banana-pro");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveModal, setSaveModal] = useState(false);
  const [promptName, setPromptName] = useState("");

  useEffect(() => {
    fetch("/api/user/apikey/full")
      .then((res) => res.json())
      .then((data) => setApiKey(data.key));
  }, []);

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
        // Save to history
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "image",
            prompt,
            model,
            resultUrl: data.url,
            metadata: { aspectRatio },
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

  const handleGeneratePrompt = async () => {
    if (!apiKey) return;
    const topic = window.prompt("이미지 주제를 입력하세요:");
    if (!topic) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, topic, type: "image" }),
      });
      const data = await res.json();
      if (data.success) {
        setPrompt(data.script);
      }
    } catch {
      // ignore
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptName || !prompt) return;

    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: promptName,
        type: "image",
        prompt,
        model,
        aspectRatio,
      }),
    });

    setSaveModal(false);
    setPromptName("");
    alert("프롬프트가 저장되었습니다!");
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
        <h1 className="text-3xl font-bold text-white mb-2">이미지 생성</h1>
        <p className="text-zinc-400">AI로 고품질 이미지를 생성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">모델</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">프롬프트</label>
                <button
                  onClick={handleGeneratePrompt}
                  disabled={generating}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {generating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI로 생성
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="이미지를 설명하세요..."
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!prompt || loading}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    이미지 생성
                  </>
                )}
              </button>
              <button
                onClick={() => setSaveModal(true)}
                disabled={!prompt}
                className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-xl text-white transition-colors"
                title="프롬프트 저장"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
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
                <img src={result} alt="Generated" className="w-full" />
              </div>
              <div className="flex gap-3">
                <a
                  href={result}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  다운로드
                </a>
                <a
                  href={`/dashboard/image-to-video?image=${encodeURIComponent(result)}`}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  영상으로 변환
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>이미지가 여기에 표시됩니다</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">프롬프트 저장</h3>
            <input
              type="text"
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              placeholder="프롬프트 이름"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSaveModal(false)}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!promptName}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-xl text-white transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
