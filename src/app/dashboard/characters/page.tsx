"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
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
  { id: "청년", name: "청년", icon: "🧑" },
  { id: "중년", name: "중년", icon: "🧔" },
  { id: "노년", name: "노년", icon: "👴" },
];

const BODY_TYPES = [
  { id: "마른", name: "마른", icon: "🦴" },
  { id: "보통", name: "보통", icon: "🧍" },
  { id: "근육질", name: "근육질", icon: "💪" },
  { id: "통통", name: "통통", icon: "🐻" },
  { id: "뚱뚱", name: "뚱뚱", icon: "🍔" },
];

const SKIN_TONES = [
  { id: "밝은 피부", name: "밝은 피부", color: "#FFE4C4" },
  { id: "보통 피부", name: "보통 피부", color: "#DEB887" },
  { id: "구릿빛 피부", name: "구릿빛 피부", color: "#CD853F" },
  { id: "어두운 피부", name: "어두운 피부", color: "#8B4513" },
];

const HAIR_STYLES = [
  { id: "짧은 머리", name: "짧은 머리", icon: "✂️" },
  { id: "중간 머리", name: "중간 머리", icon: "💇" },
  { id: "긴 머리", name: "긴 머리", icon: "👩‍🦰" },
  { id: "곱슬머리", name: "곱슬머리", icon: "🌀" },
  { id: "파마", name: "파마", icon: "💫" },
  { id: "포니테일", name: "포니테일", icon: "🎀" },
  { id: "묶은 머리", name: "묶은 머리", icon: "💈" },
  { id: "대머리", name: "대머리", icon: "🥚" },
];

const HAIR_COLORS = [
  { id: "검은색", name: "검은색", color: "#000000" },
  { id: "갈색", name: "갈색", color: "#8B4513" },
  { id: "금발", name: "금발", color: "#FFD700" },
  { id: "빨간색", name: "빨간색", color: "#B22222" },
  { id: "흰색/은색", name: "흰색/은색", color: "#C0C0C0" },
  { id: "파란색", name: "파란색", color: "#4169E1" },
  { id: "분홍색", name: "분홍색", color: "#FF69B4" },
  { id: "보라색", name: "보라색", color: "#8A2BE2" },
];

const EYE_COLORS = [
  { id: "검은색", name: "검은색", color: "#000000" },
  { id: "갈색", name: "갈색", color: "#8B4513" },
  { id: "파란색", name: "파란색", color: "#4169E1" },
  { id: "녹색", name: "녹색", color: "#228B22" },
  { id: "회색", name: "회색", color: "#808080" },
  { id: "빨간색", name: "빨간색", color: "#FF0000" },
  { id: "금색", name: "금색", color: "#FFD700" },
];

const CLOTHING_STYLES = [
  { id: "캐주얼", name: "캐주얼", icon: "👕" },
  { id: "정장", name: "정장", icon: "🤵" },
  { id: "스포츠웨어", name: "스포츠웨어", icon: "🏃" },
  { id: "한복", name: "한복", icon: "🎎" },
  { id: "교복", name: "교복", icon: "🎓" },
  { id: "군복", name: "군복", icon: "🪖" },
  { id: "의사 가운", name: "의사 가운", icon: "🩺" },
  { id: "판타지 의상", name: "판타지 의상", icon: "🧙" },
  { id: "SF 의상", name: "SF 의상", icon: "🚀" },
];

const ACCESSORIES = [
  { id: "안경", name: "안경", icon: "👓" },
  { id: "선글라스", name: "선글라스", icon: "🕶️" },
  { id: "모자", name: "모자", icon: "🧢" },
  { id: "귀걸이", name: "귀걸이", icon: "💎" },
  { id: "목걸이", name: "목걸이", icon: "📿" },
  { id: "시계", name: "시계", icon: "⌚" },
  { id: "가방", name: "가방", icon: "👜" },
  { id: "스카프", name: "스카프", icon: "🧣" },
];

const DISTINCTIVE_FEATURES = [
  { id: "수염", name: "수염", icon: "🧔" },
  { id: "콧수염", name: "콧수염", icon: "👨" },
  { id: "흉터", name: "흉터", icon: "⚔️" },
  { id: "점", name: "점", icon: "•" },
  { id: "주근깨", name: "주근깨", icon: "🌟" },
  { id: "문신", name: "문신", icon: "🐉" },
  { id: "피어싱", name: "피어싱", icon: "💍" },
  { id: "안대", name: "안대", icon: "🏴‍☠️" },
];

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    role: "",
    gender: "",
    age: "",
    personality: "",
    bodyType: "",
    skinTone: "",
    hairStyle: "",
    hairColor: "",
    eyeColor: "",
    clothingStyle: "",
    accessories: [] as string[],
    distinctiveFeatures: [] as string[],
    appearance: "",
    clothing: "",
    referenceImages: [] as string[],
    generatedImages: [] as string[],
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

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
      personality: "",
      bodyType: "",
      skinTone: "",
      hairStyle: "",
      hairColor: "",
      eyeColor: "",
      clothingStyle: "",
      accessories: [],
      distinctiveFeatures: [],
      appearance: "",
      clothing: "",
      referenceImages: [],
      generatedImages: [],
    });
    setEditingCharacter(null);
  };

  // appearance 문자열에서 상세 속성 파싱
  const parseAppearance = (appearance: string | null) => {
    if (!appearance) return {};
    const result: Record<string, string | string[]> = {};

    // 체형, 피부, 머리스타일, 머리색, 눈색 등 파싱
    BODY_TYPES.forEach(bt => {
      if (appearance.includes(bt.id)) result.bodyType = bt.id;
    });
    SKIN_TONES.forEach(st => {
      if (appearance.includes(st.id)) result.skinTone = st.id;
    });
    HAIR_STYLES.forEach(hs => {
      if (appearance.includes(hs.id)) result.hairStyle = hs.id;
    });
    HAIR_COLORS.forEach(hc => {
      if (appearance.includes(hc.id + " 머리") || appearance.includes(hc.id + "머리") || appearance.includes("머리색: " + hc.id)) result.hairColor = hc.id;
    });
    EYE_COLORS.forEach(ec => {
      if (appearance.includes(ec.id + " 눈") || appearance.includes(ec.id + "눈") || appearance.includes("눈색: " + ec.id)) result.eyeColor = ec.id;
    });

    const accessories: string[] = [];
    ACCESSORIES.forEach(acc => {
      if (appearance.includes(acc.id)) accessories.push(acc.id);
    });
    if (accessories.length > 0) result.accessories = accessories;

    const features: string[] = [];
    DISTINCTIVE_FEATURES.forEach(df => {
      if (appearance.includes(df.id)) features.push(df.id);
    });
    if (features.length > 0) result.distinctiveFeatures = features;

    return result;
  };

  // clothing 문자열에서 의상 스타일 파싱
  const parseClothing = (clothing: string | null) => {
    if (!clothing) return "";
    for (const cs of CLOTHING_STYLES) {
      if (clothing.includes(cs.id)) return cs.id;
    }
    return "";
  };

  const openModal = (character?: Character) => {
    if (character) {
      setEditingCharacter(character);
      const parsedAppearance = parseAppearance(character.appearance);
      const parsedClothingStyle = parseClothing(character.clothing);

      setFormData({
        name: character.name,
        description: character.description || "",
        role: character.role || "",
        gender: character.gender || "",
        age: character.age || "",
        personality: character.personality || "",
        bodyType: (parsedAppearance.bodyType as string) || "",
        skinTone: (parsedAppearance.skinTone as string) || "",
        hairStyle: (parsedAppearance.hairStyle as string) || "",
        hairColor: (parsedAppearance.hairColor as string) || "",
        eyeColor: (parsedAppearance.eyeColor as string) || "",
        clothingStyle: parsedClothingStyle,
        accessories: (parsedAppearance.accessories as string[]) || [],
        distinctiveFeatures: (parsedAppearance.distinctiveFeatures as string[]) || [],
        appearance: character.appearance || "",
        clothing: character.clothing || "",
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

  // 선택된 옵션들을 외모 문자열로 변환
  const generateAppearanceString = () => {
    const parts: string[] = [];

    if (formData.bodyType) parts.push(`체형: ${formData.bodyType}`);
    if (formData.skinTone) parts.push(`${formData.skinTone}`);
    if (formData.hairStyle) parts.push(`${formData.hairStyle}`);
    if (formData.hairColor) parts.push(`머리색: ${formData.hairColor}`);
    if (formData.eyeColor) parts.push(`눈색: ${formData.eyeColor}`);
    if (formData.accessories.length > 0) parts.push(`액세서리: ${formData.accessories.join(", ")}`);
    if (formData.distinctiveFeatures.length > 0) parts.push(`특징: ${formData.distinctiveFeatures.join(", ")}`);

    return parts.length > 0 ? parts.join(", ") : formData.appearance;
  };

  // 선택된 의상 스타일을 의상 문자열로 변환
  const generateClothingString = () => {
    if (formData.clothingStyle) {
      return `${formData.clothingStyle} 스타일`;
    }
    return formData.clothing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const url = editingCharacter
        ? `/api/characters/${editingCharacter.id}`
        : "/api/characters";
      const method = editingCharacter ? "PUT" : "POST";

      // appearance와 clothing 문자열 생성
      const submitData = {
        ...formData,
        appearance: generateAppearanceString(),
        clothing: generateClothingString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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

  const removeImage = (index: number) => {
    const newImages = formData.referenceImages.filter((_, i) => i !== index);
    setFormData({ ...formData, referenceImages: newImages });
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
                {/* 이미지 개수 표시 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {((character.referenceImages?.length || 0) + (character.generatedImages?.length || 0)) > 0 && (
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      이미지 {(character.referenceImages?.length || 0) + (character.generatedImages?.length || 0)}장
                    </span>
                  )}
                </div>

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

              {/* 성별 & 나이 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">성별</label>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: g.id })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          formData.gender === g.id
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {g.icon} {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">나이대</label>
                  <div className="flex flex-wrap gap-2">
                    {AGES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, age: a.id })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          formData.age === a.id
                            ? "bg-green-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {a.icon} {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">캐릭터 설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-y min-h-[80px]"
                  placeholder="캐릭터에 대한 간단한 설명 (배경, 직업 등)"
                  rows={3}
                />
              </div>

              {/* 성격 */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">성격</label>
                <textarea
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-y min-h-[80px]"
                  placeholder="캐릭터의 성격 특성 (예: 밝고 활발함, 내성적이고 조용함 등)"
                  rows={3}
                />
              </div>

              {/* 외모 상세 설정 */}
              <div className="border border-zinc-700 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  🎨 외모 상세 설정
                </h3>

                {/* 체형 & 피부색 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2">체형</label>
                    <div className="flex flex-wrap gap-1.5">
                      {BODY_TYPES.map((bt) => (
                        <button
                          key={bt.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, bodyType: formData.bodyType === bt.id ? "" : bt.id })}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            formData.bodyType === bt.id
                              ? "bg-orange-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {bt.icon} {bt.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2">피부색</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SKIN_TONES.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, skinTone: formData.skinTone === st.id ? "" : st.id })}
                          className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                            formData.skinTone === st.id
                              ? "bg-orange-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                          {st.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 머리 스타일 & 머리색 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2">헤어스타일</label>
                    <div className="flex flex-wrap gap-1.5">
                      {HAIR_STYLES.map((hs) => (
                        <button
                          key={hs.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, hairStyle: formData.hairStyle === hs.id ? "" : hs.id })}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            formData.hairStyle === hs.id
                              ? "bg-pink-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          {hs.icon} {hs.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2">머리색</label>
                    <div className="flex flex-wrap gap-1.5">
                      {HAIR_COLORS.map((hc) => (
                        <button
                          key={hc.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, hairColor: formData.hairColor === hc.id ? "" : hc.id })}
                          className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                            formData.hairColor === hc.id
                              ? "bg-pink-600 text-white"
                              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-zinc-600" style={{ backgroundColor: hc.color }} />
                          {hc.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 눈색 */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">눈색</label>
                  <div className="flex flex-wrap gap-1.5">
                    {EYE_COLORS.map((ec) => (
                      <button
                        key={ec.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, eyeColor: formData.eyeColor === ec.id ? "" : ec.id })}
                        className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                          formData.eyeColor === ec.id
                            ? "bg-cyan-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-zinc-600" style={{ backgroundColor: ec.color }} />
                        {ec.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 특징 (다중 선택) */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">특징 (다중 선택)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DISTINCTIVE_FEATURES.map((df) => (
                      <button
                        key={df.id}
                        type="button"
                        onClick={() => {
                          const features = formData.distinctiveFeatures.includes(df.id)
                            ? formData.distinctiveFeatures.filter(f => f !== df.id)
                            : [...formData.distinctiveFeatures, df.id];
                          setFormData({ ...formData, distinctiveFeatures: features });
                        }}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          formData.distinctiveFeatures.includes(df.id)
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {df.icon} {df.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 액세서리 (다중 선택) */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-2">액세서리 (다중 선택)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          const accessories = formData.accessories.includes(acc.id)
                            ? formData.accessories.filter(a => a !== acc.id)
                            : [...formData.accessories, acc.id];
                          setFormData({ ...formData, accessories });
                        }}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          formData.accessories.includes(acc.id)
                            ? "bg-indigo-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {acc.icon} {acc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 의상 설정 */}
              <div className="border border-zinc-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  👗 의상 스타일
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {CLOTHING_STYLES.map((cs) => (
                    <button
                      key={cs.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, clothingStyle: formData.clothingStyle === cs.id ? "" : cs.id })}
                      className={`px-3 py-1.5 rounded text-xs transition-colors ${
                        formData.clothingStyle === cs.id
                          ? "bg-violet-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {cs.icon} {cs.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 이미지 섹션 */}
              <div className="border border-zinc-700 rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  캐릭터 참조 이미지
                </h3>
                <p className="text-xs text-zinc-500 mb-3">
                  캐릭터 외모는 첨부된 이미지를 기반으로 묘사됩니다.
                </p>

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
                        onClick={() => removeImage(idx)}
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
