"use client";

import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check } from "lucide-react";

interface ApiKeyInputProps {
  onKeyChange: (key: string) => void;
}

export default function ApiKeyInput({ onKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("replicate_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      onKeyChange(savedKey);
      setSaved(true);
    }
  }, [onKeyChange]);

  const handleSave = () => {
    localStorage.setItem("replicate_api_key", apiKey);
    onKeyChange(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Key className="w-4 h-4 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-300">Replicate API Key</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="r8_..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!apiKey}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? "저장됨" : "저장"}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
      </p>
    </div>
  );
}
