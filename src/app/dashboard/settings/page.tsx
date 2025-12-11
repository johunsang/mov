"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check, Loader2, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/apikey")
      .then((res) => res.json())
      .then((data) => {
        setHasKey(data.hasKey);
        setMaskedKey(data.key);
      });
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/user/apikey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        setSaved(true);
        setHasKey(true);
        setMaskedKey(`${apiKey.slice(0, 8)}...`);
        setApiKey("");
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError("저장에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("API 키를 삭제하시겠습니까?")) return;
    setLoading(true);

    try {
      await fetch("/api/user/apikey", { method: "DELETE" });
      setHasKey(false);
      setMaskedKey(null);
    } catch {
      setError("삭제에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-zinc-400">계정 및 API 설정을 관리합니다</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Replicate API Key</h2>
            <p className="text-sm text-zinc-400">이미지 및 영상 생성에 사용됩니다</p>
          </div>
        </div>

        {hasKey && maskedKey && (
          <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-800 rounded-xl mb-4">
            <Check className="w-5 h-5 text-green-400" />
            <div className="flex-1">
              <p className="text-sm text-green-300">API 키가 설정되어 있습니다</p>
              <p className="text-xs text-green-400/70 font-mono">{maskedKey}</p>
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              {hasKey ? "새 API 키로 변경" : "API 키 입력"}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="r8_..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={!apiKey || loading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-medium text-white flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saved ? (
                  <Check className="w-5 h-5" />
                ) : null}
                {saved ? "저장됨" : "저장"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <p className="text-xs text-zinc-500">
            API 키는 암호화되어 안전하게 저장됩니다.{" "}
            <a
              href="https://replicate.com/account/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Replicate에서 API 키 받기 →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
