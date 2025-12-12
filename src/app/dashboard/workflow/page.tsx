"use client";

import { useState, useEffect } from "react";
import {
  Wand2,
  Loader2,
  Download,
  Save,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronRight,
  Edit2,
  Check,
  RefreshCw,
  Plus,
  Minus,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Users,
  X,
  Subtitles,
  Trash2,
  Bookmark,
} from "lucide-react";
import { IMAGE_MODELS, TEXT_MODELS } from "@/lib/models";
import {
  VIDEO_GENRES,
  VIDEO_MOODS,
  VISUAL_STYLES,
  CAMERA_ANGLES,
  SHOT_SIZES,
  CAMERA_MOVEMENTS,
  PACING_OPTIONS,
  TRANSITION_STYLES,
  COLOR_GRADES,
  TIME_SETTINGS,
  VIDEO_FORMATS,
  VIDEO_DURATIONS,
  STYLE_PRESETS,
  generateStylePrompt,
  VideoStyleOptions,
} from "@/lib/videoStyles";

type Step = "topic" | "script" | "image" | "video" | "done";

interface SceneSettings {
  cameraAngle: string;
  shotSize: string;
  cameraMovement: string;
  transitionStyle: string;
  pacing: string;
}

interface ImagePrompt {
  id: number;
  prompt1: string;
  prompt2: string;
  prompt3: string;
  settings: SceneSettings;
}

interface GeneratedImages {
  id: number;
  images: string[];
}

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

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
}

interface UserStylePreset {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  genre: string;
  customGenre: string | null;
  mood: string;
  customMood: string | null;
  visualStyle: string;
  lightingStyle: string;
  cameraAngle: string;
  shotSize: string;
  cameraMovement: string;
  pacing: string;
  transitionStyle: string;
  colorGrade: string;
  timeSetting: string;
  weatherSetting: string;
  format: string;
  duration: string;
  characterIds: string[] | null;
}

export default function WorkflowPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [textModel, setTextModel] = useState("gemini");
  const [imageModel, setImageModel] = useState("nano-banana-pro");
  const videoModel = "veo-3.1"; // 고정

  const [sceneCount, setSceneCount] = useState(3);
  const [autoSceneCount, setAutoSceneCount] = useState(true);
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<number | null>(null);

  const [saveModal, setSaveModal] = useState(false);
  const [promptName, setPromptName] = useState("");

  // Style options - 전체 영상 레벨 옵션
  const [showStyleOptions, setShowStyleOptions] = useState(true);
  const [activeStyleTab, setActiveStyleTab] = useState<string>("presets");
  const [styleOptions, setStyleOptions] = useState<VideoStyleOptions>({
    genre: "cinematic",
    mood: "epic",
    visualStyle: "realistic",
    lightingStyle: "natural",
    cameraAngle: "eye-level",
    shotSize: "medium",
    cameraMovement: "dolly-in",
    pacing: "moderate",
    transitionStyle: "dissolve",
    colorGrade: "teal-orange",
    timeSetting: "golden-hour",
    weatherSetting: "clear",
    format: "shorts",
    duration: "60",
  });

  // 기본 장면 설정 (새 장면 생성시 사용)
  const defaultSceneSettings: SceneSettings = {
    cameraAngle: "eye-level",
    shotSize: "medium",
    cameraMovement: "dolly-in",
    transitionStyle: "dissolve",
    pacing: "moderate",
  };

  // 직접 입력 상태
  const [customGenre, setCustomGenre] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [showCustomGenreInput, setShowCustomGenreInput] = useState(false);
  const [showCustomMoodInput, setShowCustomMoodInput] = useState(false);

  // 장면별 설정 편집 모달
  const [editingSceneSettings, setEditingSceneSettings] = useState<number | null>(null);

  // 캐릭터 관련 상태
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

  // 사용자 스타일 프리셋 관련 상태
  const [userPresets, setUserPresets] = useState<UserStylePreset[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [presetIcon, setPresetIcon] = useState("🎬");

  useEffect(() => {
    fetch("/api/user/apikey/full")
      .then((res) => res.json())
      .then((data) => setApiKey(data.key));

    // 캐릭터 목록 불러오기
    fetch("/api/characters")
      .then((res) => res.json())
      .then((data) => setCharacters(data));

    // 사용자 프리셋 목록 불러오기
    fetch("/api/style-presets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUserPresets(data);
      });
  }, []);

  // 영상 길이에 따라 장면 수 자동 계산 (Veo 3.1 기준: 최대 8초/장면)
  useEffect(() => {
    if (!autoSceneCount) return;

    const durationSeconds = parseInt(styleOptions.duration);
    // Veo 3.1은 최대 8초 영상 생성 가능, 따라서 총 길이 / 8 = 필요한 장면 수
    const calculatedScenes = Math.max(1, Math.ceil(durationSeconds / 8));

    setSceneCount(calculatedScenes);
  }, [styleOptions.duration, autoSceneCount]);

  const applyPreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setStyleOptions(preset.options as VideoStyleOptions);
      setShowCustomGenreInput(false);
      setShowCustomMoodInput(false);
      setCustomGenre("");
      setCustomMood("");
    }
  };

  // 사용자 프리셋 적용
  const applyUserPreset = (preset: UserStylePreset) => {
    setStyleOptions({
      genre: preset.genre,
      mood: preset.mood,
      visualStyle: preset.visualStyle,
      lightingStyle: preset.lightingStyle,
      cameraAngle: preset.cameraAngle,
      shotSize: preset.shotSize,
      cameraMovement: preset.cameraMovement,
      pacing: preset.pacing,
      transitionStyle: preset.transitionStyle,
      colorGrade: preset.colorGrade,
      timeSetting: preset.timeSetting,
      weatherSetting: preset.weatherSetting,
      format: preset.format,
      duration: preset.duration,
    });

    // 커스텀 장르/분위기 복원
    if (preset.genre === "custom" && preset.customGenre) {
      setCustomGenre(preset.customGenre);
      setShowCustomGenreInput(true);
    } else {
      setCustomGenre("");
      setShowCustomGenreInput(false);
    }

    if (preset.mood === "custom" && preset.customMood) {
      setCustomMood(preset.customMood);
      setShowCustomMoodInput(true);
    } else {
      setCustomMood("");
      setShowCustomMoodInput(false);
    }

    // 캐릭터 선택 복원
    if (preset.characterIds && preset.characterIds.length > 0) {
      const selectedChars = characters.filter(c => preset.characterIds?.includes(c.id));
      setSelectedCharacters(selectedChars);
    }
  };

  // 현재 설정을 프리셋으로 저장
  const saveCurrentAsPreset = async () => {
    if (!presetName) return;

    try {
      const res = await fetch("/api/style-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: presetName,
          description: presetDescription,
          icon: presetIcon,
          ...styleOptions,
          customGenre: styleOptions.genre === "custom" ? customGenre : null,
          customMood: styleOptions.mood === "custom" ? customMood : null,
          characterIds: selectedCharacters.map(c => c.id),
        }),
      });

      const data = await res.json();
      if (data.id) {
        setUserPresets([data, ...userPresets]);
        setShowSavePresetModal(false);
        setPresetName("");
        setPresetDescription("");
        setPresetIcon("🎬");
        alert("프리셋이 저장되었습니다!");
      }
    } catch {
      setError("프리셋 저장에 실패했습니다.");
    }
  };

  // 프리셋 삭제
  const deleteUserPreset = async (presetId: string) => {
    if (!confirm("이 프리셋을 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/style-presets/${presetId}`, { method: "DELETE" });
      setUserPresets(userPresets.filter(p => p.id !== presetId));
    } catch {
      setError("프리셋 삭제에 실패했습니다.");
    }
  };

  // 장면 설정 업데이트 함수
  const updateSceneSettings = (sceneIndex: number, key: keyof SceneSettings, value: string) => {
    const newPrompts = [...imagePrompts];
    newPrompts[sceneIndex].settings = {
      ...newPrompts[sceneIndex].settings,
      [key]: value,
    };
    setImagePrompts(newPrompts);
  };

  // 장면 스타일 프롬프트 생성 함수
  const generateSceneStylePrompt = (settings: SceneSettings): string => {
    const cameraAngle = CAMERA_ANGLES.find(c => c.id === settings.cameraAngle);
    const shotSize = SHOT_SIZES.find(s => s.id === settings.shotSize);
    const cameraMovement = CAMERA_MOVEMENTS.find(c => c.id === settings.cameraMovement);
    const transition = TRANSITION_STYLES.find(t => t.id === settings.transitionStyle);
    const pacing = PACING_OPTIONS.find(p => p.id === settings.pacing);

    return `
촬영 설정:
- 카메라 앵글: ${cameraAngle?.name} (${cameraAngle?.description})
- 샷 크기: ${shotSize?.name} (${shotSize?.description})
- 카메라 움직임: ${cameraMovement?.name} (${cameraMovement?.description})
- 전환 효과: ${transition?.name} (${transition?.description})
- 페이싱: ${pacing?.name} (${pacing?.description})
    `.trim();
  };

  // 캐릭터 정보 프롬프트 생성 함수
  const generateCharacterPrompt = (): string => {
    if (selectedCharacters.length === 0) return "";

    const characterDescriptions = selectedCharacters.map((char, idx) => {
      const parts = [];
      parts.push(`[캐릭터 ${idx + 1}: ${char.name}]`);
      if (char.role) parts.push(`- 역할: ${char.role}`);
      if (char.gender) parts.push(`- 성별: ${char.gender}`);
      if (char.age) parts.push(`- 나이: ${char.age}`);
      if (char.appearance) parts.push(`- 외모: ${char.appearance}`);
      if (char.clothing) parts.push(`- 의상: ${char.clothing}`);
      if (char.personality) parts.push(`- 성격/분위기: ${char.personality}`);
      return parts.join("\n");
    });

    return `
=== 등장인물 정보 ===
${characterDescriptions.join("\n\n")}

중요: 위 캐릭터들이 영상에 등장해야 합니다. 각 캐릭터의 외모, 의상, 성격을 정확히 반영하세요.
    `.trim();
  };

  // 캐릭터 선택/해제 함수
  const toggleCharacter = (character: Character) => {
    const isSelected = selectedCharacters.some(c => c.id === character.id);
    if (isSelected) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const generateScript = async () => {
    if (!apiKey || !topic) return;

    setLoading(true);
    setError(null);

    const styleGuide = generateStylePrompt(styleOptions, customGenre, customMood);
    const characterGuide = generateCharacterPrompt();

    try {
      setLoadingStep("스크립트 생성 중...");

      const prompts: ImagePrompt[] = [];

      for (let i = 0; i < sceneCount; i++) {
        // 각 장면별 기본 설정 생성
        const sceneSettings: SceneSettings = { ...defaultSceneSettings };
        const sceneStyleGuide = generateSceneStylePrompt(sceneSettings);

        const sceneRes = await fetch("/api/generate/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            model: textModel,
            prompt: `당신은 전문 영화 감독이자 시각 연출가입니다. 부드러운 전환이 있는 고품질 영상을 만들어야 합니다.

주제: ${topic}
장면 ${i + 1} / 총 ${sceneCount}장면

=== 전체 영상 스타일 ===
${styleGuide}

=== 이 장면의 촬영 설정 ===
${sceneStyleGuide}

${characterGuide ? `${characterGuide}\n` : ""}
이 장면에 대해 Veo 3.1로 영상을 생성할 수 있도록 2개의 이미지 프롬프트(시작 프레임, 끝 프레임)를 한글로 생성하세요:

1. 시작 프레임 (image): 장면의 시작 상태 (위 스타일 가이드의 조명, 색감, 앵글 반영)
2. 끝 프레임 (last_frame): 장면의 끝 상태, 움직임과 변화가 자연스럽게 완료된 모습

각 프롬프트는 매우 상세해야 합니다:
- 조명 상태 (방향, 강도, 색온도)
- 색감과 분위기
- 카메라 앵글과 구도
- 피사체(캐릭터)의 위치와 표정/동작 (등장인물이 있다면 그 캐릭터의 외모를 정확히 반영)
- 배경의 세부 묘사
- 시간대와 날씨의 영향

응답은 반드시 다음 형식으로 작성하세요:
FRAME1: [시작 프레임에 대한 매우 상세한 한글 프롬프트]
FRAME2: [끝 프레임에 대한 매우 상세한 한글 프롬프트]`,
          }),
        });

        const sceneData = await sceneRes.json();
        if (sceneData.success) {
          const text = sceneData.text;
          const frame1Match = text.match(/FRAME1:\s*(.+?)(?=FRAME2:|$)/s);
          const frame2Match = text.match(/FRAME2:\s*(.+?)$/s);

          prompts.push({
            id: i,
            prompt1: frame1Match ? frame1Match[1].trim() : "",  // 시작 프레임 (image)
            prompt2: frame2Match ? frame2Match[1].trim() : "",  // 끝 프레임 (last_frame)
            prompt3: "",  // Veo 3.1은 2개 프레임만 사용
            settings: sceneSettings,
          });
        }
      }

      setImagePrompts(prompts);

      // Generate video motion prompt with style
      const videoRes = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: textModel,
          prompt: `당신은 전문 영화 감독입니다. 이 주제를 바탕으로 영화적인 비디오 모션 프롬프트를 한글로 작성하세요. 150단어 이내로 작성하세요.

주제: ${topic}
장면 수: ${sceneCount}

${styleGuide}

다음 요소를 포함하여 상세히 설명하세요:
- 카메라 움직임의 구체적인 방향과 속도
- 각 장면 간의 전환 방식
- 전체적인 리듬과 페이싱
- 클라이맥스 포인트와 감정 곡선
- 조명 변화와 색감 전환`,
        }),
      });

      const videoData = await videoRes.json();
      if (videoData.success) {
        setVideoPrompt(videoData.text);
      }

      setStep("script");
    } catch {
      setError("스크립트 생성 실패");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const generateImages = async () => {
    if (!apiKey || imagePrompts.length === 0) return;

    setLoading(true);
    setError(null);
    const allImages: GeneratedImages[] = [];

    try {
      for (let i = 0; i < imagePrompts.length; i++) {
        const scene = imagePrompts[i];
        setLoadingStep(`장면 ${i + 1}/${imagePrompts.length} 이미지 생성 중...`);

        const sceneImages: string[] = [];

        // 1. 시작 프레임 생성
        if (scene.prompt1) {
          const res1 = await fetch("/api/generate/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey, model: imageModel, prompt: scene.prompt1 }),
          });
          const data1 = await res1.json();
          if (data1.success) {
            sceneImages.push(data1.url);
          }
        }

        // 2. 끝 프레임 생성 (시작 프레임을 참조하여 연속성 유지)
        if (scene.prompt2) {
          const referenceImage = sceneImages.length > 0 ? sceneImages[0] : undefined;
          const res2 = await fetch("/api/generate/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              apiKey,
              model: imageModel,
              prompt: scene.prompt2,
              referenceImage // 첫 번째 이미지를 참조로 전달
            }),
          });
          const data2 = await res2.json();
          if (data2.success) {
            sceneImages.push(data2.url);
          }
        }

        allImages.push({ id: i, images: sceneImages });
      }

      setGeneratedImages(allImages);
      setStep("image");
    } catch {
      setError("이미지 생성 실패");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const regenerateSceneImage = async (sceneIndex: number, imageIndex: number) => {
    if (!apiKey) return;

    const scene = imagePrompts[sceneIndex];
    const prompts = [scene.prompt1, scene.prompt2];  // Veo 3.1용: 2개 프레임만
    const prompt = prompts[imageIndex];

    if (!prompt) return;

    setLoading(true);
    setLoadingStep(`이미지 재생성 중...`);

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model: imageModel, prompt }),
      });

      const data = await res.json();
      if (data.success) {
        const newImages = [...generatedImages];
        newImages[sceneIndex].images[imageIndex] = data.url;
        setGeneratedImages(newImages);
      }
    } catch {
      setError("이미지 재생성 실패");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const generateVideo = async () => {
    if (!apiKey || generatedImages.length === 0) return;

    setLoading(true);
    setError(null);
    setLoadingStep("영상 생성 중...");

    try {
      const allImageUrls = generatedImages.flatMap((g) => g.images);

      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: videoModel,
          prompt: videoPrompt,
          referenceImages: allImageUrls,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVideoUrl(data.url);
        setStep("done");

        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "workflow",
            prompt: videoPrompt,
            model: `${imageModel} + ${videoModel}`,
            resultUrl: data.url,
            metadata: {
              topic,
              sceneCount,
              styleOptions,
              imagePrompts,
              generatedImages: allImageUrls,
            },
          }),
        });
      } else {
        setError(data.error);
      }
    } catch {
      setError("영상 생성 실패");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const updatePrompt = (sceneIndex: number, frameIndex: number, value: string) => {
    const newPrompts = [...imagePrompts];
    if (frameIndex === 0) newPrompts[sceneIndex].prompt1 = value;
    else if (frameIndex === 1) newPrompts[sceneIndex].prompt2 = value;
    else newPrompts[sceneIndex].prompt3 = value;
    setImagePrompts(newPrompts);
  };

  const handleSavePrompt = async () => {
    if (!promptName) return;

    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: promptName,
        type: "workflow",
        prompt: JSON.stringify({ imagePrompts, styleOptions }),
        videoPrompt,
        imageModel,
        videoModel,
      }),
    });

    setSaveModal(false);
    setPromptName("");
    alert("워크플로우가 저장되었습니다!");
  };

  const reset = () => {
    setStep("topic");
    setTopic("");
    setImagePrompts([]);
    setVideoPrompt("");
    setGeneratedImages([]);
    setVideoUrl(null);
    setSubtitles([]);
    setError(null);
  };

  // 자막 생성 함수
  const generateSubtitles = async () => {
    if (!apiKey || imagePrompts.length === 0) return;

    setGeneratingSubtitles(true);

    try {
      const durationPerScene = parseInt(styleOptions.duration) / sceneCount;
      const characterGuide = generateCharacterPrompt();

      const res = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: textModel,
          prompt: `당신은 전문 영상 자막 작가입니다. 아래 영상 정보를 바탕으로 각 장면에 맞는 자막/나레이션을 생성하세요.

주제: ${topic}
총 장면 수: ${sceneCount}
장면당 길이: 약 ${Math.round(durationPerScene)}초
총 영상 길이: ${styleOptions.duration}초

${characterGuide ? `${characterGuide}\n` : ""}

각 장면 내용:
${imagePrompts.map((scene, idx) => `
장면 ${idx + 1}:
- 시작 프레임: ${scene.prompt1}
- 끝 프레임: ${scene.prompt2}
`).join("\n")}

각 장면에 대해 2-3개의 자막을 생성하세요. 자막은 짧고 임팩트 있게 작성하세요.
응답은 반드시 다음 JSON 형식으로 작성하세요:
[
  {"scene": 1, "order": 1, "text": "첫 번째 자막"},
  {"scene": 1, "order": 2, "text": "두 번째 자막"},
  {"scene": 2, "order": 1, "text": "다음 장면 자막"},
  ...
]

오직 JSON 배열만 반환하세요. 다른 설명은 포함하지 마세요.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          // JSON 파싱 시도
          let jsonText = data.text.trim();
          // JSON 블록만 추출
          const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }

          const subtitleData = JSON.parse(jsonText);

          // 자막 데이터를 시간 정보와 함께 변환
          const newSubtitles: Subtitle[] = [];
          const subtitleDuration = durationPerScene / 3; // 장면당 3개 자막 기준

          subtitleData.forEach((sub: { scene: number; order: number; text: string }, idx: number) => {
            const sceneStartTime = (sub.scene - 1) * durationPerScene;
            const startTime = sceneStartTime + (sub.order - 1) * subtitleDuration;

            newSubtitles.push({
              id: idx,
              startTime: startTime,
              endTime: startTime + subtitleDuration - 0.5,
              text: sub.text,
            });
          });

          setSubtitles(newSubtitles);
        } catch {
          console.error("Failed to parse subtitles JSON");
          setError("자막 파싱에 실패했습니다. 다시 시도해주세요.");
        }
      }
    } catch {
      setError("자막 생성에 실패했습니다.");
    } finally {
      setGeneratingSubtitles(false);
    }
  };

  // SRT 형식으로 변환
  const formatTimeToSRT = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  // SRT 파일 다운로드
  const downloadSRT = () => {
    if (subtitles.length === 0) return;

    const srtContent = subtitles
      .map((sub, idx) => {
        return `${idx + 1}\n${formatTimeToSRT(sub.startTime)} --> ${formatTimeToSRT(sub.endTime)}\n${sub.text}\n`;
      })
      .join("\n");

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "video"}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // VTT 파일 다운로드
  const downloadVTT = () => {
    if (subtitles.length === 0) return;

    const formatTimeToVTT = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
    };

    const vttContent = `WEBVTT\n\n` + subtitles
      .map((sub, idx) => {
        return `${idx + 1}\n${formatTimeToVTT(sub.startTime)} --> ${formatTimeToVTT(sub.endTime)}\n${sub.text}\n`;
      })
      .join("\n");

    const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "video"}_subtitles.vtt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // TXT 파일 다운로드 (일반 텍스트)
  const downloadTXT = () => {
    if (subtitles.length === 0) return;

    const txtContent = subtitles.map((sub) => sub.text).join("\n\n");

    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic || "video"}_subtitles.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 스타일 옵션 버튼 컴포넌트
  const StyleButton = ({ item, selected, onClick }: { item: { id: string; name: string; description: string; icon?: string }; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg text-left transition-all ${
        selected
          ? "bg-purple-600/20 border-purple-500 border"
          : "bg-zinc-800 border border-zinc-700 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-center gap-2">
        {item.icon && <span className="text-lg">{item.icon}</span>}
        <p className="font-medium text-white text-sm">{item.name}</p>
      </div>
      <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{item.description}</p>
    </button>
  );

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

  const styleTabs = [
    { id: "presets", name: "프리셋", icon: "✨" },
    { id: "basic", name: "기본", icon: "🎬" },
    { id: "visual", name: "비주얼", icon: "🎨" },
    { id: "environment", name: "환경", icon: "🌍" },
    { id: "format", name: "형식", icon: "📐" },
  ];
  // 촬영/편집 탭은 장면별로 설정하므로 전체 영상 레벨에서 제거

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">워크플로우</h1>
        <p className="text-zinc-400">스크립트 → 이미지 (장면당 3장) → 영상 자동화</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto">
        {[
          { key: "topic", label: "주제 입력", icon: FileText },
          { key: "script", label: "스크립트", icon: Edit2 },
          { key: "image", label: "이미지 생성", icon: ImageIcon },
          { key: "done", label: "영상 생성", icon: Video },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center shrink-0">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                step === s.key
                  ? "bg-purple-600/20 text-purple-400"
                  : ["script", "image", "done"].indexOf(step) >
                    ["topic", "script", "image", "done"].indexOf(s.key)
                  ? "text-green-400"
                  : "text-zinc-500"
              }`}
            >
              <s.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{s.label}</span>
            </div>
            {i < 3 && <ChevronRight className="w-4 h-4 text-zinc-600 mx-2" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-300">
          {error}
        </div>
      )}

      {loading && loadingStep && (
        <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700 rounded-xl text-purple-300 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          {loadingStep}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        {/* Step 1: Topic */}
        {step === "topic" && (
          <div className="space-y-6">
            {/* Style Options */}
            <div className="border border-zinc-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowStyleOptions(!showStyleOptions)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-750 transition-colors"
              >
                <div className="flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">영상 스타일 옵션</span>
                  <span className="text-xs text-zinc-500">(영화 제작 수준의 상세 설정)</span>
                </div>
                {showStyleOptions ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {showStyleOptions && (
                <div className="p-4">
                  {/* Style Tabs */}
                  <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-zinc-700">
                    {styleTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveStyleTab(tab.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                          activeStyleTab === tab.id
                            ? "bg-purple-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-4">
                    {/* 프리셋 탭 */}
                    {activeStyleTab === "presets" && (
                      <div className="space-y-6">
                        {/* 내 프리셋 저장 버튼 */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-zinc-400">
                            <Bookmark className="w-4 h-4 inline mr-1" />
                            현재 설정을 프리셋으로 저장
                          </label>
                          <button
                            onClick={() => setShowSavePresetModal(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            현재 설정 저장
                          </button>
                        </div>

                        {/* 내 저장된 프리셋 */}
                        {userPresets.length > 0 && (
                          <div>
                            <label className="block text-sm text-zinc-400 mb-3">
                              <Bookmark className="w-4 h-4 inline mr-1" />
                              내 저장 프리셋 ({userPresets.length}개)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {userPresets.map((preset) => (
                                <div
                                  key={preset.id}
                                  className="relative p-4 rounded-xl text-left transition-all bg-gradient-to-br from-green-900/20 to-zinc-900 border border-green-700/50 hover:border-green-500 group"
                                >
                                  <button
                                    onClick={() => applyUserPreset(preset)}
                                    className="w-full text-left"
                                  >
                                    <span className="text-2xl mb-2 block">{preset.icon || "🎬"}</span>
                                    <p className="font-semibold text-white">{preset.name}</p>
                                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                                      {preset.description || "저장된 프리셋"}
                                    </p>
                                    {preset.characterIds && (preset.characterIds as string[]).length > 0 && (
                                      <p className="text-xs text-green-400 mt-1">
                                        <Users className="w-3 h-3 inline mr-1" />
                                        캐릭터 {(preset.characterIds as string[]).length}명 포함
                                      </p>
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteUserPreset(preset.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 기본 프리셋 */}
                        <div>
                          <label className="block text-sm text-zinc-400 mb-3">
                            <Sparkles className="w-4 h-4 inline mr-1" />
                            기본 프리셋 - 클릭 한 번으로 전문가 설정 적용
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {STYLE_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                onClick={() => applyPreset(preset.id)}
                                className="p-4 rounded-xl text-left transition-all bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 hover:border-purple-500 hover:from-purple-900/20 hover:to-zinc-900"
                              >
                                <span className="text-2xl mb-2 block">{preset.icon}</span>
                                <p className="font-semibold text-white">{preset.name}</p>
                                <p className="text-xs text-zinc-400 mt-1">{preset.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 기본 탭 */}
                    {activeStyleTab === "basic" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">장르</label>
                            <button
                              onClick={() => {
                                setShowCustomGenreInput(!showCustomGenreInput);
                                if (!showCustomGenreInput) {
                                  setStyleOptions({ ...styleOptions, genre: "custom" });
                                }
                              }}
                              className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                                showCustomGenreInput || styleOptions.genre === "custom"
                                  ? "bg-purple-600/20 text-purple-400"
                                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                              }`}
                            >
                              <Edit2 className="w-3 h-3" />
                              직접 입력
                            </button>
                          </div>
                          {showCustomGenreInput || styleOptions.genre === "custom" ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={customGenre}
                                onChange={(e) => setCustomGenre(e.target.value)}
                                placeholder="원하는 장르를 직접 입력하세요 (예: 다크 판타지, 사이버펑크 액션)"
                                className="w-full bg-zinc-800 border border-purple-500 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                              />
                              <p className="text-xs text-zinc-500">입력한 장르가 프롬프트에 그대로 반영됩니다.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                              {VIDEO_GENRES.map((genre) => (
                                <StyleButton
                                  key={genre.id}
                                  item={genre}
                                  selected={styleOptions.genre === genre.id}
                                  onClick={() => setStyleOptions({ ...styleOptions, genre: genre.id })}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">분위기</label>
                            <button
                              onClick={() => {
                                setShowCustomMoodInput(!showCustomMoodInput);
                                if (!showCustomMoodInput) {
                                  setStyleOptions({ ...styleOptions, mood: "custom" });
                                }
                              }}
                              className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                                showCustomMoodInput || styleOptions.mood === "custom"
                                  ? "bg-blue-600/20 text-blue-400"
                                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                              }`}
                            >
                              <Edit2 className="w-3 h-3" />
                              직접 입력
                            </button>
                          </div>
                          {showCustomMoodInput || styleOptions.mood === "custom" ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={customMood}
                                onChange={(e) => setCustomMood(e.target.value)}
                                placeholder="원하는 분위기를 직접 입력하세요 (예: 몽환적이면서 신비로운, 잔잔하지만 긴장감 있는)"
                                className="w-full bg-zinc-800 border border-blue-500 rounded-lg px-4 py-3 text-white placeholder-zinc-500"
                              />
                              <p className="text-xs text-zinc-500">입력한 분위기가 프롬프트에 그대로 반영됩니다.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                              {VIDEO_MOODS.map((mood) => (
                                <StyleButton
                                  key={mood.id}
                                  item={mood}
                                  selected={styleOptions.mood === mood.id}
                                  onClick={() => setStyleOptions({ ...styleOptions, mood: mood.id })}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 비주얼 탭 */}
                    {activeStyleTab === "visual" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">비주얼 스타일</label>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {VISUAL_STYLES.map((style) => (
                              <StyleButton
                                key={style.id}
                                item={style}
                                selected={styleOptions.visualStyle === style.id}
                                onClick={() => setStyleOptions({ ...styleOptions, visualStyle: style.id })}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">색보정 / 컬러그레이딩</label>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {COLOR_GRADES.map((color) => (
                              <StyleButton
                                key={color.id}
                                item={color}
                                selected={styleOptions.colorGrade === color.id}
                                onClick={() => setStyleOptions({ ...styleOptions, colorGrade: color.id })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 환경 탭 */}
                    {activeStyleTab === "environment" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">시간대</label>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {TIME_SETTINGS.map((time) => (
                              <StyleButton
                                key={time.id}
                                item={time}
                                selected={styleOptions.timeSetting === time.id}
                                onClick={() => setStyleOptions({ ...styleOptions, timeSetting: time.id })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 형식 탭 */}
                    {activeStyleTab === "format" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">영상 형식</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {VIDEO_FORMATS.map((format) => (
                              <StyleButton
                                key={format.id}
                                item={format}
                                selected={styleOptions.format === format.id}
                                onClick={() => setStyleOptions({ ...styleOptions, format: format.id })}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-2">영상 길이</label>
                          <div className="grid grid-cols-4 gap-2">
                            {VIDEO_DURATIONS.map((duration) => (
                              <StyleButton
                                key={duration.id}
                                item={duration}
                                selected={styleOptions.duration === duration.id}
                                onClick={() => setStyleOptions({ ...styleOptions, duration: duration.id })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Style Summary */}
            <div className="p-4 bg-zinc-800/50 rounded-xl">
              <p className="text-sm text-zinc-400 mb-3">현재 선택한 전체 영상 스타일:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                  {styleOptions.genre === "custom" ? (
                    <>✏️ {customGenre || "직접 입력"}</>
                  ) : (
                    <>{VIDEO_GENRES.find((g) => g.id === styleOptions.genre)?.icon} {VIDEO_GENRES.find((g) => g.id === styleOptions.genre)?.name}</>
                  )}
                </span>
                <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                  {styleOptions.mood === "custom" ? (
                    <>✏️ {customMood || "직접 입력"}</>
                  ) : (
                    <>{VIDEO_MOODS.find((m) => m.id === styleOptions.mood)?.icon} {VIDEO_MOODS.find((m) => m.id === styleOptions.mood)?.name}</>
                  )}
                </span>
                <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                  {VISUAL_STYLES.find((v) => v.id === styleOptions.visualStyle)?.icon} {VISUAL_STYLES.find((v) => v.id === styleOptions.visualStyle)?.name}
                </span>
                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-xs">
                  {TIME_SETTINGS.find((t) => t.id === styleOptions.timeSetting)?.icon} {TIME_SETTINGS.find((t) => t.id === styleOptions.timeSetting)?.name}
                </span>
                <span className="px-2 py-1 bg-pink-600/20 text-pink-300 rounded-full text-xs">
                  {COLOR_GRADES.find((c) => c.id === styleOptions.colorGrade)?.icon} {COLOR_GRADES.find((c) => c.id === styleOptions.colorGrade)?.name}
                </span>
                <span className="px-2 py-1 bg-teal-600/20 text-teal-300 rounded-full text-xs">
                  {TIME_SETTINGS.find((t) => t.id === styleOptions.timeSetting)?.icon} {TIME_SETTINGS.find((t) => t.id === styleOptions.timeSetting)?.name}
                </span>
                <span className="px-2 py-1 bg-cyan-600/20 text-cyan-300 rounded-full text-xs">
                  {VIDEO_FORMATS.find((f) => f.id === styleOptions.format)?.icon} {VIDEO_FORMATS.find((f) => f.id === styleOptions.format)?.name}
                </span>
                <span className="px-2 py-1 bg-red-600/20 text-red-300 rounded-full text-xs">
                  {VIDEO_DURATIONS.find((d) => d.id === styleOptions.duration)?.icon} {VIDEO_DURATIONS.find((d) => d.id === styleOptions.duration)?.name}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">촬영/편집 옵션(카메라 앵글, 샷 크기, 움직임, 전환 효과 등)은 스크립트 단계에서 장면별로 설정합니다.</p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">텍스트 생성 모델</label>
              <select
                value={textModel}
                onChange={(e) => setTextModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              >
                {Object.entries(TEXT_MODELS).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.name} - {m.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">이미지 생성 모델</label>
                <select
                  value={imageModel}
                  onChange={(e) => setImageModel(e.target.value)}
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
                <label className="block text-sm text-zinc-400 mb-2">영상 생성 모델</label>
                <div className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white">
                  Google Veo 3.1 - 레퍼런스 이미지 지원
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-zinc-400">장면 수</label>
                <button
                  onClick={() => setAutoSceneCount(!autoSceneCount)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    autoSceneCount
                      ? "bg-purple-600/20 text-purple-400"
                      : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {autoSceneCount ? "자동" : "수동"}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setAutoSceneCount(false);
                    setSceneCount(Math.max(1, sceneCount - 1));
                  }}
                  disabled={autoSceneCount}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold text-white w-12 text-center">{sceneCount}</span>
                <button
                  onClick={() => {
                    setAutoSceneCount(false);
                    setSceneCount(Math.min(15, sceneCount + 1));
                  }}
                  disabled={autoSceneCount}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="text-zinc-500 text-sm">
                  (총 {sceneCount * 2}장의 이미지, 장면당 약 {Math.round(parseInt(styleOptions.duration) / sceneCount)}초)
                </span>
              </div>
              {autoSceneCount && (
                <p className="text-xs text-zinc-500 mt-2">
                  영상 길이 {VIDEO_DURATIONS.find(d => d.id === styleOptions.duration)?.name}에 맞춰 자동 설정됨
                </p>
              )}
            </div>

            {/* 캐릭터 선택 섹션 */}
            <div className="border border-zinc-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowCharacterModal(!showCharacterModal)}
                className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800 hover:bg-zinc-750 transition-colors"
              >
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="font-medium">등장인물 선택</span>
                  {selectedCharacters.length > 0 && (
                    <span className="px-2 py-0.5 bg-green-600/20 text-green-400 rounded-full text-xs">
                      {selectedCharacters.length}명 선택됨
                    </span>
                  )}
                </div>
                {showCharacterModal ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {showCharacterModal && (
                <div className="p-4">
                  {characters.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                      <p className="text-zinc-500 text-sm mb-3">등록된 캐릭터가 없습니다.</p>
                      <a
                        href="/dashboard/characters"
                        className="text-sm text-green-400 hover:text-green-300"
                      >
                        캐릭터 만들러 가기 →
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500">영상에 등장할 캐릭터를 선택하세요 (여러 명 선택 가능)</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {characters.map((char) => {
                          const isSelected = selectedCharacters.some(c => c.id === char.id);
                          return (
                            <button
                              key={char.id}
                              onClick={() => toggleCharacter(char)}
                              className={`p-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? "bg-green-600/20 border-green-500 border-2"
                                  : "bg-zinc-800 border border-zinc-700 hover:border-zinc-600"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {(char.referenceImages?.[0] || char.generatedImages?.[0]) ? (
                                  <img
                                    src={char.referenceImages?.[0] || char.generatedImages?.[0]}
                                    alt={char.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-zinc-500" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white text-sm truncate">{char.name}</p>
                                  <p className="text-xs text-zinc-500">{char.role || "역할 없음"}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {selectedCharacters.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-700">
                          <p className="text-xs text-zinc-400 mb-2">선택된 캐릭터:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCharacters.map((char) => (
                              <span
                                key={char.id}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs"
                              >
                                {char.name}
                                <button
                                  onClick={() => toggleCharacter(char)}
                                  className="hover:text-white"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">영상 주제 및 상세 설명</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`영상의 주제와 원하는 내용을 상세하게 작성해주세요.

예시:
- 주제: 옥토퍼스맨의 도시 모험
- 배경: 현대 도시의 밤거리
- 분위기: 긴장감 있는 액션
- 주요 장면: 빌딩 사이를 날아다니는 히어로, 악당과의 대결
- 특별한 요청사항이 있다면 작성해주세요`}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 min-h-[150px] resize-y"
              />
              <p className="text-xs text-zinc-500 mt-1">상세하게 작성할수록 더 정확한 스크립트가 생성됩니다</p>
            </div>

            <button
              onClick={generateScript}
              disabled={!topic || loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-zinc-700 disabled:to-zinc-700 rounded-xl font-medium text-white flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  스크립트 생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  스크립트 생성
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Script Review */}
        {step === "script" && (
          <div className="space-y-6">
            {imagePrompts.map((scene, sceneIndex) => (
              <div key={scene.id} className="border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">장면 {sceneIndex + 1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setEditingSceneSettings(editingSceneSettings === sceneIndex ? null : sceneIndex)
                      }
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded bg-blue-600/20"
                    >
                      <Settings className="w-3 h-3" />
                      촬영설정
                    </button>
                    <button
                      onClick={() =>
                        setEditingScene(editingScene === sceneIndex ? null : sceneIndex)
                      }
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      {editingScene === sceneIndex ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Edit2 className="w-3 h-3" />
                      )}
                      {editingScene === sceneIndex ? "완료" : "프롬프트 수정"}
                    </button>
                  </div>
                </div>

                {/* 장면별 촬영 설정 패널 */}
                {editingSceneSettings === sceneIndex && (
                  <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-blue-600/30">
                    <h4 className="text-sm font-medium text-blue-400 mb-3">촬영 및 편집 설정 (장면 {sceneIndex + 1})</h4>
                    <div className="space-y-3">
                      {/* 카메라 앵글 */}
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">카메라 앵글</label>
                        <div className="flex flex-wrap gap-1">
                          {CAMERA_ANGLES.map((angle) => (
                            <button
                              key={angle.id}
                              onClick={() => updateSceneSettings(sceneIndex, "cameraAngle", angle.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                scene.settings.cameraAngle === angle.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              }`}
                            >
                              {angle.icon} {angle.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 샷 크기 */}
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">샷 크기</label>
                        <div className="flex flex-wrap gap-1">
                          {SHOT_SIZES.map((shot) => (
                            <button
                              key={shot.id}
                              onClick={() => updateSceneSettings(sceneIndex, "shotSize", shot.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                scene.settings.shotSize === shot.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              }`}
                            >
                              {shot.icon} {shot.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 카메라 무브먼트 */}
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">카메라 움직임</label>
                        <div className="flex flex-wrap gap-1">
                          {CAMERA_MOVEMENTS.map((movement) => (
                            <button
                              key={movement.id}
                              onClick={() => updateSceneSettings(sceneIndex, "cameraMovement", movement.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                scene.settings.cameraMovement === movement.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              }`}
                            >
                              {movement.icon} {movement.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 전환 효과 */}
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">전환 효과 (다음 장면으로)</label>
                        <div className="flex flex-wrap gap-1">
                          {TRANSITION_STYLES.map((transition) => (
                            <button
                              key={transition.id}
                              onClick={() => updateSceneSettings(sceneIndex, "transitionStyle", transition.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                scene.settings.transitionStyle === transition.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              }`}
                            >
                              {transition.icon} {transition.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* 페이싱 */}
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">속도감</label>
                        <div className="flex flex-wrap gap-1">
                          {PACING_OPTIONS.map((pacing) => (
                            <button
                              key={pacing.id}
                              onClick={() => updateSceneSettings(sceneIndex, "pacing", pacing.id)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                scene.settings.pacing === pacing.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              }`}
                            >
                              {pacing.icon} {pacing.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* 현재 설정 요약 */}
                    <div className="mt-3 pt-3 border-t border-zinc-700">
                      <p className="text-xs text-zinc-500">
                        현재 설정: {CAMERA_ANGLES.find(c => c.id === scene.settings.cameraAngle)?.name} ·
                        {SHOT_SIZES.find(s => s.id === scene.settings.shotSize)?.name} ·
                        {CAMERA_MOVEMENTS.find(c => c.id === scene.settings.cameraMovement)?.name} ·
                        {TRANSITION_STYLES.find(t => t.id === scene.settings.transitionStyle)?.name} ·
                        {PACING_OPTIONS.find(p => p.id === scene.settings.pacing)?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* 현재 촬영 설정 요약 (접혀있을 때) */}
                {editingSceneSettings !== sceneIndex && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {CAMERA_ANGLES.find(c => c.id === scene.settings.cameraAngle)?.icon} {CAMERA_ANGLES.find(c => c.id === scene.settings.cameraAngle)?.name}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {SHOT_SIZES.find(s => s.id === scene.settings.shotSize)?.icon} {SHOT_SIZES.find(s => s.id === scene.settings.shotSize)?.name}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {CAMERA_MOVEMENTS.find(c => c.id === scene.settings.cameraMovement)?.icon} {CAMERA_MOVEMENTS.find(c => c.id === scene.settings.cameraMovement)?.name}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">
                      {TRANSITION_STYLES.find(t => t.id === scene.settings.transitionStyle)?.icon} → {TRANSITION_STYLES.find(t => t.id === scene.settings.transitionStyle)?.name}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "시작 프레임 (image)", value: scene.prompt1, index: 0 },
                    { label: "끝 프레임 (last_frame)", value: scene.prompt2, index: 1 },
                  ].map((frame) => (
                    <div key={frame.index}>
                      <label className="block text-xs text-zinc-500 mb-1">{frame.label}</label>
                      <textarea
                        value={frame.value}
                        onChange={(e) => updatePrompt(sceneIndex, frame.index, e.target.value)}
                        readOnly={editingScene !== sceneIndex}
                        rows={4}
                        className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-white resize-none ${
                          editingScene === sceneIndex ? "border-purple-500" : "border-zinc-700"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm text-zinc-400 mb-2">비디오 모션 프롬프트</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("topic")}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                이전
              </button>
              <button
                onClick={() => setSaveModal(true)}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={generateImages}
                disabled={loading}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-xl font-medium text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    이미지 생성 중...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    이미지 생성 ({sceneCount * 2}장)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Image Review */}
        {step === "image" && generatedImages.length > 0 && (
          <div className="space-y-6">
            {generatedImages.map((scene, sceneIndex) => (
              <div key={scene.id} className="border border-zinc-700 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-4">장면 {sceneIndex + 1}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {scene.images.map((imageUrl, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700">
                        <img
                          src={imageUrl}
                          alt={`Scene ${sceneIndex + 1} Frame ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => regenerateSceneImage(sceneIndex, imgIndex)}
                        disabled={loading}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        title="재생성"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-zinc-500 mt-1 text-center">
                        {["시작", "중간", "끝"][imgIndex]} 프레임
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("script")}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                이전
              </button>
              <button
                onClick={generateImages}
                disabled={loading}
                className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                전체 재생성
              </button>
              <button
                onClick={generateVideo}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 rounded-xl font-medium text-white flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    영상 생성 중...
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    영상 생성
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && videoUrl && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-zinc-400 mb-2">생성된 영상</p>
              <div className="rounded-xl overflow-hidden border border-zinc-700">
                <video src={videoUrl} controls className="w-full" />
              </div>
            </div>

            <div>
              <p className="text-sm text-zinc-400 mb-2">
                사용된 이미지 ({generatedImages.flatMap((g) => g.images).length}장)
              </p>
              <div className="grid grid-cols-6 gap-2">
                {generatedImages.flatMap((scene, sIdx) =>
                  scene.images.map((img, iIdx) => (
                    <div
                      key={`${sIdx}-${iIdx}`}
                      className="aspect-video rounded-lg overflow-hidden border border-zinc-700"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 자막 섹션 */}
            <div className="border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Subtitles className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-medium text-white">자막</h3>
                </div>
                {subtitles.length === 0 ? (
                  <button
                    onClick={generateSubtitles}
                    disabled={generatingSubtitles}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-zinc-700 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                  >
                    {generatingSubtitles ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        자막 생성
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={generateSubtitles}
                    disabled={generatingSubtitles}
                    className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    재생성
                  </button>
                )}
              </div>

              {subtitles.length > 0 && (
                <>
                  {/* 자막 미리보기 */}
                  <div className="bg-zinc-800 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {subtitles.map((sub) => (
                        <div key={sub.id} className="flex gap-3 text-sm">
                          <span className="text-zinc-500 w-20 shrink-0">
                            {formatTimeToSRT(sub.startTime).split(",")[0]}
                          </span>
                          <span className="text-white">{sub.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 다운로드 버튼들 */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={downloadSRT}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      SRT 다운로드
                    </button>
                    <button
                      onClick={downloadVTT}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      VTT 다운로드
                    </button>
                    <button
                      onClick={downloadTXT}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      TXT 다운로드
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    SRT: 대부분의 동영상 플레이어와 호환 | VTT: 웹 브라우저 호환 | TXT: 일반 텍스트
                  </p>
                </>
              )}

              {subtitles.length === 0 && !generatingSubtitles && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  자막을 생성하면 SRT, VTT, TXT 형식으로 다운로드할 수 있습니다.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <a
                href={videoUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-white flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                영상 다운로드
              </a>
              <button
                onClick={reset}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium text-white"
              >
                새로 만들기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">워크플로우 저장</h3>
            <input
              type="text"
              value={promptName}
              onChange={(e) => setPromptName(e.target.value)}
              placeholder="워크플로우 이름"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSaveModal(false)}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                취소
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!promptName}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-xl text-white"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSavePresetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Bookmark className="w-5 h-5 inline mr-2" />
              스타일 프리셋 저장
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              현재 설정한 스타일 옵션과 선택한 캐릭터를 프리셋으로 저장합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">프리셋 이름 *</label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="예: 내 유튜브 쇼츠 스타일"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">설명 (선택)</label>
                <input
                  type="text"
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="이 프리셋에 대한 설명"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">아이콘 선택</label>
                <div className="flex flex-wrap gap-2">
                  {["🎬", "📱", "💕", "👻", "🎥", "📷", "💥", "💭", "🌟", "🎨", "🎵", "🏢"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setPresetIcon(emoji)}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        presetIcon === emoji
                          ? "bg-green-600 scale-110"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCharacters.length > 0 && (
                <div className="p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <p className="text-sm text-green-400">
                    <Users className="w-4 h-4 inline mr-1" />
                    {selectedCharacters.length}명의 캐릭터가 함께 저장됩니다
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {selectedCharacters.map(c => c.name).join(", ")}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSavePresetModal(false);
                  setPresetName("");
                  setPresetDescription("");
                  setPresetIcon("🎬");
                }}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                취소
              </button>
              <button
                onClick={saveCurrentAsPreset}
                disabled={!presetName}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 rounded-xl text-white flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
