"use client";

import { useState, useEffect } from "react";
import { FileText, Trash2, Edit2, Play, Image, Video, Wand2, Loader2, X } from "lucide-react";

interface Prompt {
  id: string;
  name: string;
  type: string;
  prompt: string;
  videoPrompt?: string;
  model: string;
  imageModel?: string;
  videoModel?: string;
  aspectRatio?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Prompt | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedVideoPrompt, setEditedVideoPrompt] = useState("");
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data.prompts || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 프롬프트를 삭제하시겠습니까?")) return;

    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  const handleEdit = (prompt: Prompt) => {
    setEditModal(prompt);
    setEditedName(prompt.name);
    setEditedPrompt(prompt.prompt);
    setEditedVideoPrompt(prompt.videoPrompt || "");
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    await fetch(`/api/prompts/${editModal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editedName,
        prompt: editedPrompt,
        videoPrompt: editedVideoPrompt || undefined,
      }),
    });

    setPrompts(
      prompts.map((p) =>
        p.id === editModal.id
          ? { ...p, name: editedName, prompt: editedPrompt, videoPrompt: editedVideoPrompt }
          : p
      )
    );
    setEditModal(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5 text-purple-400" />;
      case "video":
        return <Video className="w-5 h-5 text-green-400" />;
      case "workflow":
        return <Wand2 className="w-5 h-5 text-orange-400" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "image":
        return "이미지";
      case "video":
        return "영상";
      case "workflow":
        return "워크플로우";
      default:
        return type;
    }
  };

  const getUseLink = (prompt: Prompt) => {
    switch (prompt.type) {
      case "image":
        return `/dashboard/image?prompt=${encodeURIComponent(prompt.id)}`;
      case "video":
        return `/dashboard/video?prompt=${encodeURIComponent(prompt.id)}`;
      case "workflow":
        return `/dashboard/workflow?prompt=${encodeURIComponent(prompt.id)}`;
      default:
        return "#";
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">저장된 프롬프트</h1>
        <p className="text-zinc-400">저장한 프롬프트를 관리합니다</p>
      </div>

      {prompts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400">저장된 프롬프트가 없습니다</p>
          <p className="text-sm text-zinc-500 mt-2">이미지, 영상 생성 시 프롬프트를 저장해보세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(prompt.type)}
                  <div>
                    <h3 className="font-semibold text-white">{prompt.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {getTypeLabel(prompt.type)} · {prompt.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getUseLink(prompt)}
                    className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                    title="사용"
                  >
                    <Play className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-zinc-300 line-clamp-2 mb-2">{prompt.prompt}</p>

              {prompt.videoPrompt && (
                <p className="text-xs text-zinc-500 line-clamp-1">
                  모션: {prompt.videoPrompt}
                </p>
              )}

              <p className="text-xs text-zinc-600 mt-3">
                {new Date(prompt.updatedAt).toLocaleString("ko-KR")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">프롬프트 수정</h3>
              <button
                onClick={() => setEditModal(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">이름</label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">프롬프트</label>
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none"
                />
              </div>

              {editModal.type === "workflow" && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">비디오 모션 프롬프트</label>
                  <textarea
                    value={editedVideoPrompt}
                    onChange={(e) => setEditedVideoPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors"
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
