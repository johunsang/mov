"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Wand2,
  Loader2,
  X,
  User,
  Image as ImageIcon,
} from "lucide-react";

interface Character {
  id: string;
  name: string;
  description: string | null;
  role: string | null;
  gender: string | null;
  age: string | null;
  appearance: string | null;
  clothing: string | null;
  personality: string | null;
  referenceImages: string[] | null;
  generatedImages: string[] | null;
  createdAt: string;
}

const ROLES = [
  { id: "주인공", name: "주인공", icon: "🌟" },
  { id: "조연", name: "조연", icon: "👥" },
  { id: "악당", name: "악당", icon: "😈" },
  { id: "엑스트라", name: "엑스트라", icon: "👤" },
  { id: "기타", name: "기타", icon: "📝" },
];

const GENDERS = [
  { id: "남성", name: "남성", icon: "👨" },
  { id: "여성", name: "여성", icon: "👩" },
  { id: "기타", name: "기타", icon: "🧑" },
];

const AGES = [
  { id: "아기", name: "아기", icon: "👶" },
  { id: "어린이", name: "어린이", icon: "🧒" },
  { id: "청소년", name: "청소년", icon: "🧑‍🎓" },
  { id: "청년", name: "청년", icon: "🧑‍💼" },
  { id: "중년", name: "중년", icon: "🧔" },
  { id: "노년", name: "노년", icon: "👴" },
];

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    role: "",
    gender: "",
    age: "",
    appearance: "",
    clothing: "",
    personality: "",
    referenceImages: [] as string[],
    generatedImages: [] as string[],
  });

  useEffect(() => {
    fetchCharacters();
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    const res = await fetch("/api/user/apikey/full");
    const data = await res.json();
    setApiKey(data.key);
  };

  const fetchCharacters = async () => {
    try {
      const res = await fetch("/api/characters");
      const data = await res.json();
      setCharacters(data);
    } catch {
      console.error("Failed to fetch characters");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      role: "",
      gender: "",
      age: "",
      appearance: "",
      clothing: "",
      personality: "",
      referenceImages: [],
      generatedImages: [],
    });
    setEditingCharacter(null);
  };

  const openModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      setFormData({
        name: character.name,
        description: character.description || "",
        role: character.role || "",
        gender: character.gender || "",
        age: character.age || "",
        appearance: character.appearance || "",
        clothing: character.clothing || "",
        personality: character.personality || "",
        referenceImages: character.referenceImages || [],
        generatedImages: character.generatedImages || [],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const url = editingCharacter
        ? `/api/characters/${editingCharacter.id}`
        : "/api/characters";
      const method = editingCharacter ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCharacters();
        closeModal();
      }
    } catch {
      console.error("Failed to save character");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 캐릭터를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/characters/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCharacters();
      }
    } catch {
      console.error("Failed to delete character");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (res.ok) {
          const data = await res.json();
          newImages.push(data.url);
        }
      } catch {
        console.error("Failed to upload file");
      }
    }

    setFormData({
      ...formData,
      referenceImages: [...formData.referenceImages, ...newImages],
    });
    setUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number, type: "reference" | "generated") => {
    if (type === "reference") {
      const newImages = formData.referenceImages.filter((_, i) => i !== index);
      setFormData({ ...formData, referenceImages: newImages });
    } else {
      const newImages = formData.generatedImages.filter((_, i) => i !== index);
      setFormData({ ...formData, generatedImages: newImages });
    }
  };

  const generateCharacterImage = async () => {
    if (!apiKey || !formData.appearance) {
      alert("API 키와 외모 설명이 필요합니다.");
      return;
    }

    setGenerating(true);

    try {
      // 캐릭터 정보로 프롬프트 생성
      const characterPrompt = `고품질 캐릭터 초상화, ${formData.gender || ""} ${formData.age || ""}, ${formData.appearance}. ${formData.clothing ? `의상: ${formData.clothing}` : ""} ${formData.personality ? `분위기: ${formData.personality}` : ""}`.trim();

      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: "nano-banana-pro",
          prompt: characterPrompt,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormData({
          ...formData,
          generatedImages: [...formData.generatedImages, data.url],
        });
      } else {
        alert("이미지 생성에 실패했습니다: " + data.error);
      }
    } catch {
      alert("이미지 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">캐릭터 관리</h1>
          <p className="text-zinc-400">영상에 등장할 캐릭터를 만들고 관리하세요</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-white flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          새 캐릭터
        </button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center p-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <User className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">등록된 캐릭터가 없습니다.</p>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-white"
          >
            첫 캐릭터 만들기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {/* 캐릭터 이미지 */}
              <div className="aspect-square bg-zinc-800 relative">
                {(character.referenceImages?.[0] || character.generatedImages?.[0]) ? (
                  <img
                    src={character.referenceImages?.[0] || character.generatedImages?.[0]}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-zinc-600" />
                  </div>
                )}
                {/* 역할 뱃지 */}
                {character.role && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded-full text-xs text-white">
                    {ROLES.find((r) => r.id === character.role)?.icon} {character.role}
                  </span>
                )}
              </div>

              {/* 캐릭터 정보 */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{character.name}</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {character.gender && (
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {character.gender}
                    </span>
                  )}
                  {character.age && (
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {character.age}
                    </span>
                  )}
                </div>
                {character.description && (
                  <p className="text-sm text-zinc-500 line-clamp-2">{character.description}</p>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openModal(character)}
                    className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm text-red-400 flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 캐릭터 생성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingCharacter ? "캐릭터 수정" : "새 캐릭터 만들기"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-zinc-800 rounded-lg">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">이름 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                    placeholder="캐릭터 이름"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">역할</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.id })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          formData.role === role.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {role.icon} {role.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">성별</label>
                  <div className="flex gap-2">
                    {GENDERS.map((gender) => (
                      <button
                        key={gender.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: gender.id })}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                          formData.gender === gender.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {gender.icon} {gender.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">나이대</label>
                  <div className="flex flex-wrap gap-2">
                    {AGES.map((age) => (
                      <button
                        key={age.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, age: age.id })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          formData.age === age.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {age.icon} {age.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">간략한 설명</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  placeholder="한 줄로 캐릭터를 설명해주세요"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">외모 상세 설명</label>
                <textarea
                  value={formData.appearance}
                  onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white resize-none"
                  rows={3}
                  placeholder="얼굴 형태, 머리 색상, 눈 색상, 피부톤, 특징적인 외모 등을 자세히 설명해주세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">의상 스타일</label>
                  <textarea
                    value={formData.clothing}
                    onChange={(e) => setFormData({ ...formData, clothing: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white resize-none"
                    rows={2}
                    placeholder="주로 입는 의상, 색상, 스타일 등"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">성격 특성</label>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white resize-none"
                    rows={2}
                    placeholder="성격, 분위기, 특징적인 행동 등"
                  />
                </div>
              </div>

              {/* 이미지 섹션 */}
              <div className="border border-zinc-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  캐릭터 이미지
                </h3>

                {/* 참조 이미지 */}
                <div className="mb-4">
                  <label className="block text-xs text-zinc-500 mb-2">참조 이미지 (로컬 업로드)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.referenceImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Reference ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, "reference")}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-20 h-20 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center hover:border-zinc-600 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-zinc-500" />
                      )}
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* AI 생성 이미지 */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">AI 생성 이미지</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.generatedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Generated ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx, "generated")}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={generateCharacterImage}
                      disabled={generating || !formData.appearance}
                      className="w-20 h-20 border-2 border-dashed border-purple-700 rounded-lg flex flex-col items-center justify-center hover:border-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 text-purple-500" />
                          <span className="text-[10px] text-purple-500 mt-1">AI 생성</span>
                        </>
                      )}
                    </button>
                  </div>
                  {!formData.appearance && (
                    <p className="text-xs text-zinc-500">외모 설명을 입력하면 AI로 캐릭터 이미지를 생성할 수 있습니다.</p>
                  )}
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-white"
                >
                  {editingCharacter ? "수정" : "생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
