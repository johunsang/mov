"use client";

import { useState, useEffect } from "react";
import { Video, Loader2, Download, Save, Sparkles, Plus, X } from "lucide-react";
import { VIDEO_MODELS } from "@/lib/models";

export default function VideoPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState("veo-3.1");
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
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

  const selectedModel = VIDEO_MODELS[model as keyof typeof VIDEO_MODELS];

  const handleGenerate = async () => {
    if (!apiKey || !prompt) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model, prompt, referenceImages }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.url);
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video",
            prompt,
            model,
            resultUrl: data.url,
            metadata: { referenceImages },
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
    const topic = window.prompt("영상 주제를 입력하세요:");
    if (!topic) return;

    setGenerating(true);
    try {
      const res = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, topic, type: "video" }),
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

  const addReferenceImage = () => {
    if (newImageUrl && !referenceImages.includes(newImageUrl)) {
      setReferenceImages([...referenceImages, newImageUrl]);
      setNewImageUrl("");
    }
  };

  const removeReferenceImage = (url: string) => {
    setReferenceImages(referenceImages.filter((img) => img !== url));
  };

  const handleSavePrompt = async () => {
    if (!promptName || !prompt) return;

    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: promptName,
        type: "video",
        prompt,
        model,
        referenceImages,
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
        <h1 className="text-3xl font-bold text-white mb-2">영상 생성</h1>
        <p className="text-zinc-400">텍스트로 AI 영상을 생성합니다</p>
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
                {Object.entries(VIDEO_MODELS).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
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
                placeholder="영상을 설명하세요..."
                rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 resize-none"
              />
            </div>

            {selectedModel?.supportsReferenceImages && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2">레퍼런스 이미지</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="이미지 URL"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white placeholder-zinc-500"
                  />
                  <button
                    onClick={addReferenceImage}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {referenceImages.map((url, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1 bg-zinc-800 rounded-lg text-sm text-zinc-300"
                      >
                        <span className="truncate max-w-[150px]">{url}</span>
                        <button
                          onClick={() => removeReferenceImage(url)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!prompt || loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    영상 생성
                  </>
                )}
              </button>
              <button
                onClick={() => setSaveModal(true)}
                disabled={!prompt}
                className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-xl text-white transition-colors"
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
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>영상이 여기에 표시됩니다</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
