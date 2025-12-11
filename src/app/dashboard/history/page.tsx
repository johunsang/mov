"use client";

import { useState, useEffect } from "react";
import { History, Image, Video, Film, Wand2, Loader2, ExternalLink } from "lucide-react";

interface Generation {
  id: string;
  type: string;
  prompt: string;
  model: string;
  resultUrl: string | null;
  status: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchGenerations();
  }, [filter]);

  const fetchGenerations = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      params.set("limit", "50");

      const res = await fetch(`/api/generations?${params}`);
      const data = await res.json();
      setGenerations(data.generations || []);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5 text-purple-400" />;
      case "video":
        return <Video className="w-5 h-5 text-green-400" />;
      case "image-to-video":
        return <Film className="w-5 h-5 text-orange-400" />;
      case "workflow":
        return <Wand2 className="w-5 h-5 text-pink-400" />;
      default:
        return <History className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "image":
        return "이미지";
      case "video":
        return "영상";
      case "image-to-video":
        return "이미지→영상";
      case "workflow":
        return "워크플로우";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">생성 기록</h1>
        <p className="text-zinc-400">생성한 이미지와 영상 기록을 확인합니다</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "전체" },
          { value: "image", label: "이미지" },
          { value: "video", label: "영상" },
          { value: "image-to-video", label: "이미지→영상" },
          { value: "workflow", label: "워크플로우" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-purple-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {generations.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <History className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400">생성 기록이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {gen.resultUrl && (
                <div className="aspect-video bg-zinc-800 relative">
                  {gen.type === "image" ? (
                    <img
                      src={gen.resultUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={gen.resultUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <a
                    href={gen.resultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(gen.type)}
                  <span className="text-sm font-medium text-white">
                    {getTypeLabel(gen.type)}
                  </span>
                  <span className="text-xs text-zinc-500">· {gen.model}</span>
                </div>

                <p className="text-sm text-zinc-400 line-clamp-2 mb-2">{gen.prompt}</p>

                <p className="text-xs text-zinc-600">
                  {new Date(gen.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
