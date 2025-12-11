"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Key, Monitor, Loader2, Film, Shield } from "lucide-react";

// PC 시리얼 생성 함수 (브라우저 핑거프린트 기반)
function generatePcSerial(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("화수분", 2, 2);
  }
  const canvasData = canvas.toDataURL();

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    canvasData.substring(0, 50),
  ].join("|");

  // 간단한 해시 생성
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(16).toUpperCase().padStart(16, "0");
}

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pcSerial, setPcSerial] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // PC 시리얼 자동 생성
    const serial = generatePcSerial();
    setPcSerial(serial);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      token,
      pcSerial,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">화수분 영상 생성기</h1>
          <p className="text-zinc-400 mt-2">화수분 토큰으로 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              화수분 토큰
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                placeholder="화수분 토큰을 입력하세요"
                required
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              화수분 가제트에서 발급받은 토큰을 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">
              <Monitor className="w-4 h-4 inline mr-1" />
              PC 시리얼
            </label>
            <div className="relative">
              <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={pcSerial}
                readOnly
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-zinc-400 font-mono cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              자동으로 생성된 PC 시리얼입니다
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                인증 중...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                토큰으로 로그인
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">토큰 발급 방법</h3>
          <ol className="text-xs text-zinc-500 space-y-1 list-decimal list-inside">
            <li>
              <a href="https://hwasubun.ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                화수분 홈페이지 (hwasubun.ai)
              </a>
              에 접속합니다
            </li>
            <li>로그인 후 마이페이지에서 토큰을 발급받습니다</li>
            <li>발급받은 토큰을 위 입력란에 붙여넣기 합니다</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
