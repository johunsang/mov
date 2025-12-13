"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wand2,
  Loader2,
  Download,
  Save,
  Image as ImageIcon,
  Video,
  FileText,
  ChevronRight,
  ChevronLeft,
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
  Music,
  ArrowLeft,
  MessageCircle,
  Mic,
  Waves,
  Upload,
} from "lucide-react";
import { IMAGE_MODELS, TEXT_MODELS, IMAGE_TO_VIDEO_MODELS, USD_TO_KRW, ImageModelKey, TextModelKey, ImageToVideoModelKey } from "@/lib/models";
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
  prompt1: string;  // 시작 프레임 이미지 프롬프트 (정적)
  prompt2: string;  // 끝 프레임 이미지 프롬프트 (정적)
  prompt3: string;
  videoPrompt: string;  // 장면별 비디오 모션 프롬프트 (동적)
  settings: SceneSettings;
  // 카툰 대사 (말풍선)
  dialogue1?: string; // 시작 프레임 대사
  dialogue2?: string; // 중간 프레임 대사
  dialogue3?: string; // 끝 프레임 대사
}

interface GeneratedImages {
  id: number;
  images: string[];
  seeds: number[]; // 각 이미지의 seed 값
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

interface AudioOptions {
  enableMusic: boolean;
  musicStyle: string;
  customMusicStyle: string;
  musicMood: string;
  enableSoundEffects: boolean;
  soundEffectTypes: string[];
  enableNarration: boolean;
  narrationStyle: string;
  narrationVoice: string;
  narrationLanguage: string;
}

interface TopicHistory {
  id: string;
  topic: string;
  background: string;
  mood: string;
  scenes: string;
  storyline: string;
  special: string;
  createdAt: string;
  updatedAt?: string;
  favorite?: boolean;
  styleOptions?: VideoStyleOptions;
  customGenre?: string;
  customMood?: string;
  characterIds?: string[]; // 선택된 캐릭터 ID
  imageSeeds?: number[][]; // 각 장면별 이미지 시드 배열
  imagePrompts?: ImagePrompt[]; // 저장된 이미지 프롬프트
  audioOptions?: AudioOptions; // 오디오 옵션
  styleReferenceImages?: string[]; // 스타일 참조 이미지 (느낌 이미지)
  styleReferenceText?: string; // 스타일 참조 텍스트 설명
}

interface StyleOption {
  id: string;
  type: string;
  optionId: string;
  name: string;
  description: string | null;
  icon: string | null;
  isSystem: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown> | null;
}

// CustomStyleOption is now StyleOption (interface removed as unused)

type StyleOptionType = "genre" | "mood" | "visualStyle" | "cameraAngle" | "shotSize" | "cameraMovement" | "pacing" | "transitionStyle" | "colorGrade" | "timeSetting" | "weatherSetting";

export default function WorkflowPage() {
  // 히스토리에서 로딩 중일 때 자동저장 방지용 ref
  const isLoadingFromHistoryRef = useRef(false);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState("");
  const [topicBackground, setTopicBackground] = useState("");
  const [topicMood, setTopicMood] = useState("");
  const [topicScenes, setTopicScenes] = useState("");
  const [topicStoryline, setTopicStoryline] = useState("");
  const [topicSpecial, setTopicSpecial] = useState("");
  const [textModel, setTextModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedTextModel") || "gemini";
    }
    return "gemini";
  });
  const [imageModel, setImageModel] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedImageModel") || "nano-banana-pro";
    }
    return "nano-banana-pro";
  });
  const [i2vModel, _setI2vModel] = useState<ImageToVideoModelKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("selectedI2vModel") as ImageToVideoModelKey) || "kling-i2v";
    }
    return "kling-i2v";
  });
  void _setI2vModel; // reserved for future use
  const videoModel = "veo-3.1"; // 고정

  const [sceneCount, setSceneCount] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedSceneCount");
      return saved ? parseInt(saved) : 3;
    }
    return 3;
  });
  const [autoSceneCount, setAutoSceneCount] = useState(true);
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false);

  // 배경음악 관련 상태
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicPrompt, setMusicPrompt] = useState("");
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const [musicDuration, setMusicDuration] = useState(30);

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

  // 스타일 참조 이미지 (느낌 이미지)
  const [styleReferenceImages, setStyleReferenceImages] = useState<string[]>([]);
  const [styleReferenceText, setStyleReferenceText] = useState(""); // 텍스트로 스타일 설명
  const [isUploadingStyleRef, setIsUploadingStyleRef] = useState(false);

  // 장면별 설정 편집 모달
  const [editingSceneSettings, setEditingSceneSettings] = useState<number | null>(null);

  // 캐릭터 관련 상태
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  // 캐릭터별 이미지 모드: "attached" (첨부 사용) | "ai_reference" (AI 참조) | "ai_create" (새로 생성)
  const [characterImageModes, setCharacterImageModes] = useState<Record<string, "attached" | "ai_reference" | "ai_create">>({});

  // 사용자 스타일 프리셋 관련 상태
  const [userPresets, setUserPresets] = useState<UserStylePreset[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<UserStylePreset | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [presetIcon, setPresetIcon] = useState("🎬");

  // 주제 히스토리 관련 상태
  const [topicHistory, setTopicHistory] = useState<TopicHistory[]>([]);
  // 페이지네이션 상태
  const [topicHistoryPage, setTopicHistoryPage] = useState(0);
  const ITEMS_PER_PAGE = 5;

  // 주제 작업 모드 상태: "select" (선택 화면) | "edit" (편집 중)
  const [topicMode, setTopicMode] = useState<"select" | "edit">("select");
  // 현재 작업 중인 주제 ID (기존 주제 수정 시 사용)
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);

  // 대사(말풍선) 옵션
  const [enableDialogue, setEnableDialogue] = useState(false);
  const [_autoGenerateDialogue, _setAutoGenerateDialogue] = useState(false);
  void _autoGenerateDialogue; void _setAutoGenerateDialogue; // reserved for future use

  // 오디오 옵션 (음악, 효과음, 나레이션)
  const [audioOptions, setAudioOptions] = useState({
    enableMusic: false,
    musicStyle: "cinematic", // cinematic, electronic, acoustic, orchestral, ambient, pop, jazz, custom
    customMusicStyle: "",
    musicMood: "epic", // epic, calm, tense, happy, sad, mysterious, romantic, energetic
    enableSoundEffects: false,
    soundEffectTypes: [] as string[], // ambient, action, nature, urban, scifi, horror
    enableNarration: false,
    narrationStyle: "documentary", // documentary, storytelling, dramatic, casual, professional
    narrationVoice: "male", // male, female, neutral
    narrationLanguage: "korean", // korean, english
  });

  // 다운로드 추적 상태
  const [imagesDownloaded, setImagesDownloaded] = useState(false);
  const [videoDownloaded, setVideoDownloaded] = useState(false);

  // 스타일 옵션 관련 상태 (DB에서 로드)
  const [dbStyleOptions, setDbStyleOptions] = useState<StyleOption[]>([]);
  const [_isUserAdmin, setIsUserAdmin] = useState(false);
  void _isUserAdmin; // reserved for future use (admin UI)
  const [showStyleOptionModal, setShowStyleOptionModal] = useState(false);
  const [editingStyleOption, setEditingStyleOption] = useState<StyleOption | null>(null);
  const [styleOptionForm, setStyleOptionForm] = useState({
    type: "genre" as StyleOptionType,
    name: "",
    description: "",
    icon: "🎬",
  });

  // DB에서 타입별 옵션 가져오기 (시스템 + 커스텀 통합)
  // const getOptionsForType = (type: string) => {
  //   return dbStyleOptions.filter(opt => opt.type === type);
  // };

  // 커스텀 옵션만 가져오기 (관리자가 아닌 경우에만 표시할 때 사용)
  const getCustomOptionsForType = (type: string) => {
    return dbStyleOptions.filter(opt => opt.type === type && !opt.isSystem);
  };

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

    // 스타일 옵션 불러오기 (DB에서 시스템 + 커스텀 통합)
    fetch("/api/style-options")
      .then((res) => res.json())
      .then((data) => {
        if (data.options && Array.isArray(data.options)) {
          setDbStyleOptions(data.options);
        }
        if (data.isAdmin !== undefined) {
          setIsUserAdmin(data.isAdmin);
        }
      });

    // 주제 히스토리 불러오기 (localStorage)
    const savedHistory = localStorage.getItem("topicHistory");
    if (savedHistory) {
      try {
        setTopicHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse topic history:", e);
      }
    }

    // 현재 작업 중인 주제 입력 복원 (localStorage)
    const savedCurrentTopic = localStorage.getItem("currentTopicInput");
    if (savedCurrentTopic) {
      try {
        const parsed = JSON.parse(savedCurrentTopic);
        // 복원 시 첫 번째 자동 저장 스킵 (이미 저장된 값이므로)
        if (parsed.topic) {
          isLoadingFromHistoryRef.current = true;
        }
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.background) setTopicBackground(parsed.background);
        if (parsed.mood) setTopicMood(parsed.mood);
        if (parsed.scenes) setTopicScenes(parsed.scenes);
        if (parsed.storyline) setTopicStoryline(parsed.storyline);
        if (parsed.special) setTopicSpecial(parsed.special);
        // 영상 스타일 옵션 복원
        if (parsed.styleOptions) setStyleOptions(parsed.styleOptions);
        if (parsed.customGenre) setCustomGenre(parsed.customGenre);
        if (parsed.customMood) setCustomMood(parsed.customMood);
        if (parsed.audioOptions) setAudioOptions(parsed.audioOptions);
        // characterIds는 캐릭터 로드 후 별도 처리
      } catch (e) {
        console.error("Failed to parse current topic input:", e);
      }
    }
  }, []);

  // 캐릭터가 로드된 후 저장된 캐릭터 선택 복원
  useEffect(() => {
    if (characters.length === 0) return;

    const savedCurrentTopic = localStorage.getItem("currentTopicInput");
    if (savedCurrentTopic) {
      try {
        const parsed = JSON.parse(savedCurrentTopic);
        if (parsed.characterIds && Array.isArray(parsed.characterIds) && parsed.characterIds.length > 0) {
          const restoredCharacters = characters.filter((c) =>
            parsed.characterIds.includes(c.id)
          );
          if (restoredCharacters.length > 0) {
            setSelectedCharacters(restoredCharacters);
          }
        }
      } catch (e) {
        console.error("Failed to restore selected characters:", e);
      }
    }
  }, [characters]);

  // 주제 입력 변경시 자동 저장 (디바운스 적용)
  useEffect(() => {
    const currentInput = {
      topic,
      background: topicBackground,
      mood: topicMood,
      scenes: topicScenes,
      storyline: topicStoryline,
      special: topicSpecial,
      characterIds: selectedCharacters.map((c) => c.id),
      styleOptions,
      customGenre,
      customMood,
      audioOptions,
    };
    localStorage.setItem("currentTopicInput", JSON.stringify(currentInput));

    // 1초 디바운스 후 히스토리에 자동 저장
    const debounceTimer = setTimeout(() => {
      if (topic.trim()) {
        // 히스토리에서 막 로드한 직후의 첫 번째 저장은 스킵 (이미 저장된 값이므로)
        if (isLoadingFromHistoryRef.current) {
          console.log("히스토리 로드 직후 - 첫 번째 저장 스킵, 이후 저장은 허용");
          isLoadingFromHistoryRef.current = false;
          return;
        }
        autoSaveTopicToHistory(
          topic,
          topicBackground,
          topicMood,
          topicScenes,
          topicStoryline,
          topicSpecial,
          styleOptions,
          customGenre,
          customMood,
          selectedCharacters.map((c) => c.id)
        );
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [topic, topicBackground, topicMood, topicScenes, topicStoryline, topicSpecial, styleOptions, customGenre, customMood, selectedCharacters, audioOptions]);

  // 영상 길이에 따라 장면 수 자동 계산 (Veo 3.1 기준: 최대 8초/장면)
  useEffect(() => {
    if (!autoSceneCount) return;

    const durationSeconds = parseInt(styleOptions.duration);
    // Veo 3.1은 최대 8초 영상 생성 가능, 따라서 총 길이 / 8 = 필요한 장면 수
    const calculatedScenes = Math.max(1, Math.ceil(durationSeconds / 8));

    setSceneCount(calculatedScenes);
  }, [styleOptions.duration, autoSceneCount]);

  // 모델 선택값 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("selectedTextModel", textModel);
  }, [textModel]);

  useEffect(() => {
    localStorage.setItem("selectedImageModel", imageModel);
  }, [imageModel]);

  useEffect(() => {
    localStorage.setItem("selectedI2vModel", i2vModel);
  }, [i2vModel]);

  useEffect(() => {
    localStorage.setItem("selectedSceneCount", sceneCount.toString());
  }, [sceneCount]);

  // 이미지/영상 생성 시 다운로드 상태 초기화
  useEffect(() => {
    if (generatedImages.length > 0) {
      setImagesDownloaded(false);
    }
  }, [generatedImages]);

  useEffect(() => {
    if (videoUrls.length > 0) {
      setVideoDownloaded(false);
    }
  }, [videoUrls]);

  // 페이지 떠날 때 경고 (다운로드하지 않은 콘텐츠가 있을 경우)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedImages = generatedImages.length > 0 && !imagesDownloaded;
      const hasUnsavedVideo = videoUrls.length > 0 && !videoDownloaded;

      if (hasUnsavedImages || hasUnsavedVideo) {
        e.preventDefault();
        e.returnValue = "다운로드하지 않은 이미지/영상이 있습니다. 페이지를 떠나면 삭제됩니다.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [generatedImages, videoUrls, imagesDownloaded, videoDownloaded]);

  // 이미지 다운로드 함수
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("다운로드 실패:", err);
      setError("다운로드에 실패했습니다");
    }
  };

  // 모든 이미지 다운로드
  const downloadAllImages = async () => {
    for (let sceneIdx = 0; sceneIdx < generatedImages.length; sceneIdx++) {
      const scene = generatedImages[sceneIdx];
      for (let imgIdx = 0; imgIdx < scene.images.length; imgIdx++) {
        const frameNames = ["시작", "끝"];
        await downloadImage(
          scene.images[imgIdx],
          `장면${sceneIdx + 1}_${frameNames[imgIdx] || imgIdx + 1}.png`
        );
      }
    }
    setImagesDownloaded(true);
  };

  // 영상 다운로드 (모든 장면 영상 다운로드)
  const downloadAllVideos = async () => {
    if (videoUrls.length === 0) return;
    for (let i = 0; i < videoUrls.length; i++) {
      await downloadImage(videoUrls[i], `화수분_장면${i + 1}_${Date.now()}.mp4`);
    }
    setVideoDownloaded(true);
  };

  // 개별 영상 다운로드
  const downloadSingleVideo = async (url: string, sceneIndex: number) => {
    await downloadImage(url, `화수분_장면${sceneIndex + 1}_${Date.now()}.mp4`);
  };

  // 예상 비용 계산 함수
  const calculateEstimatedCost = () => {
    const imageCount = sceneCount * 2; // 장면당 2개 이미지 (시작/끝 프레임)
    const videoCount = sceneCount; // 장면당 1개 영상

    const imageModelData = IMAGE_MODELS[imageModel as ImageModelKey];
    const i2vModelData = IMAGE_TO_VIDEO_MODELS[i2vModel];
    const textModelData = TEXT_MODELS[textModel as TextModelKey];

    // 텍스트 생성 비용 (스크립트 + 대사 생성 2회 정도)
    const textCost = (textModelData?.pricePerRun || 0) * 3;

    // 이미지 생성 비용
    const imageCost = (imageModelData?.pricePerRun || 0) * imageCount;

    // 영상 생성 비용 (초당 가격 * 최대 시간 * 영상 수)
    // 효과음/나레이션이 포함되면 $0.40/초, 미포함이면 $0.20/초 (배경음악은 별도 모델)
    const hasVideoAudio = audioOptions.enableSoundEffects || audioOptions.enableNarration;
    const pricePerSecond = hasVideoAudio
      ? (i2vModelData?.pricePerSecondWithAudio || 0.40)
      : (i2vModelData?.pricePerSecondWithoutAudio || 0.20);
    const maxDuration = i2vModelData?.maxDuration || 10;
    const videoCost = pricePerSecond * maxDuration * videoCount;

    // 배경음악 비용 (별도 모델로 생성)
    const totalVideoDuration = maxDuration * videoCount;
    const musicCost = audioOptions.enableMusic ? (0.01 * totalVideoDuration) : 0; // $0.01/초

    const totalUSD = textCost + imageCost + videoCost + musicCost;
    const totalKRW = Math.round(totalUSD * USD_TO_KRW);

    return {
      textCost: Math.round(textCost * USD_TO_KRW),
      imageCost: Math.round(imageCost * USD_TO_KRW),
      videoCost: Math.round(videoCost * USD_TO_KRW),
      musicCost: Math.round(musicCost * USD_TO_KRW),
      totalKRW,
      totalUSD: totalUSD.toFixed(2),
      hasVideoAudio,
      hasMusic: audioOptions.enableMusic,
      maxDuration,
    };
  };

  const applyPreset = (presetId: string) => {
    console.log("applyPreset called with:", presetId);
    const preset = STYLE_PRESETS.find(p => p.id === presetId);
    console.log("Found preset:", preset);
    if (preset) {
      // lightingStyle과 weatherSetting은 deprecated이므로 제외하고 적용
      const { lightingStyle: _lightingStyle, weatherSetting: _weatherSetting, ...validOptions } = preset.options as VideoStyleOptions & { lightingStyle?: string; weatherSetting?: string };
      void _lightingStyle; void _weatherSetting; // deprecated fields
      console.log("Applying options:", validOptions);
      setStyleOptions(validOptions as VideoStyleOptions);
      setShowCustomGenreInput(false);
      setShowCustomMoodInput(false);
      setCustomGenre("");
      setCustomMood("");
    }
  };

  // 주제 히스토리 자동 저장 (입력 변경 시 기존 항목 업데이트 또는 새로 추가)
  const autoSaveTopicToHistory = (
    newTopic: string,
    newBackground: string,
    newMood: string,
    newScenes: string,
    newStoryline: string,
    newSpecial: string,
    newStyleOptions?: VideoStyleOptions,
    newCustomGenre?: string,
    newCustomMood?: string,
    newCharacterIds?: string[]
  ) => {
    if (!newTopic.trim()) return;

    // 클로저 문제를 피하기 위해 localStorage에서 직접 읽어옴
    let currentHistory: TopicHistory[] = [];
    try {
      const savedHistory = localStorage.getItem("topicHistory");
      if (savedHistory) {
        currentHistory = JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error("Failed to parse topic history:", e);
    }

    console.log("=== autoSaveTopicToHistory 호출 ===", {
      topic: newTopic,
      savedGenre: newStyleOptions?.genre,
      savedVisualStyle: newStyleOptions?.visualStyle,
      savedMood: newStyleOptions?.mood,
      currentHistoryCount: currentHistory.length,
      currentHistoryTopics: currentHistory.map(h => h.topic),
    });

    // 같은 주제가 이미 있으면 업데이트, 없으면 새로 추가
    const existingIndex = currentHistory.findIndex(
      (item) => item.topic.trim().toLowerCase() === newTopic.trim().toLowerCase()
    );

    let updatedHistory: TopicHistory[];

    if (existingIndex !== -1) {
      // 기존 항목 업데이트 (즐겨찾기 상태 유지)
      console.log(`기존 항목 업데이트 (index: ${existingIndex})`, {
        oldStyleOptions: currentHistory[existingIndex]?.styleOptions,
        newStyleOptions: newStyleOptions,
      });
      updatedHistory = currentHistory.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              background: newBackground,
              mood: newMood,
              scenes: newScenes,
              storyline: newStoryline,
              special: newSpecial,
              styleOptions: newStyleOptions || item.styleOptions,
              customGenre: newCustomGenre ?? item.customGenre,
              customMood: newCustomMood ?? item.customMood,
              characterIds: (newCharacterIds && newCharacterIds.length > 0) ? newCharacterIds : item.characterIds,
              audioOptions,
              createdAt: new Date().toISOString(),
            }
          : item
      );
    } else {
      // 새 항목 추가
      console.log("새 항목 추가", { styleOptions: newStyleOptions });
      const newHistory: TopicHistory = {
        id: Date.now().toString(),
        topic: newTopic,
        background: newBackground,
        mood: newMood,
        scenes: newScenes,
        storyline: newStoryline,
        special: newSpecial,
        styleOptions: newStyleOptions,
        customGenre: newCustomGenre,
        customMood: newCustomMood,
        characterIds: newCharacterIds,
        audioOptions,
        createdAt: new Date().toISOString(),
        favorite: false,
      };
      updatedHistory = [newHistory, ...currentHistory].slice(0, 30); // 최대 30개 저장
    }

    console.log("저장 완료:", {
      updatedHistoryCount: updatedHistory.length,
      savedItem: updatedHistory.find(h => h.topic.toLowerCase() === newTopic.toLowerCase())?.styleOptions,
    });
    setTopicHistory(updatedHistory);
    localStorage.setItem("topicHistory", JSON.stringify(updatedHistory));
  };

  // 주제 히스토리에서 불러오기
  const loadTopicFromHistory = (item: TopicHistory) => {
    // 히스토리 로딩 중에는 자동저장 방지
    isLoadingFromHistoryRef.current = true;

    setTopic(item.topic);
    setTopicBackground(item.background);
    setTopicMood(item.mood);
    setTopicScenes(item.scenes);
    setTopicStoryline(item.storyline || "");
    setTopicSpecial(item.special);

    // 영상 스타일 옵션 불러오기 (저장된 값이 있으면 사용, 없으면 기본값 유지하지 않고 명시적으로 설정)
    if (item.styleOptions) {
      setStyleOptions(item.styleOptions);
      // 스타일 옵션이 있으면 패널 열고 basic 탭으로 전환해서 선택된 옵션 보여주기
      setShowStyleOptions(true);
      setActiveStyleTab("basic");
    } else {
      // 기본 스타일 옵션으로 리셋
      setStyleOptions({
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
      // 스타일 옵션 패널 열고 basic 탭으로
      setShowStyleOptions(true);
      setActiveStyleTab("basic");
    }

    // 커스텀 장르/무드 설정 (저장된 값 또는 빈 문자열로 리셋)
    setCustomGenre(item.customGenre || "");
    setCustomMood(item.customMood || "");

    // 저장된 캐릭터 복원
    if (item.characterIds && item.characterIds.length > 0) {
      const restoredCharacters = characters.filter((c) =>
        item.characterIds!.includes(c.id)
      );
      console.log("[히스토리 로드] 캐릭터 복원:", {
        savedCharacterIds: item.characterIds,
        availableCharacters: characters.length,
        restoredCharacters: restoredCharacters.map(c => c.name),
      });
      setSelectedCharacters(restoredCharacters);
    } else {
      console.log("[히스토리 로드] 저장된 캐릭터 없음");
      setSelectedCharacters([]);
    }

    // 저장된 이미지 프롬프트와 시드 복원
    if (item.imagePrompts && item.imagePrompts.length > 0) {
      setImagePrompts(item.imagePrompts);
    } else {
      setImagePrompts([]);
    }

    if (item.imageSeeds && item.imageSeeds.length > 0) {
      // seed만 있고 이미지가 없으면 빈 이미지로 생성 (재생성 시 사용)
      const restoredImages: GeneratedImages[] = item.imageSeeds.map((seeds, idx) => ({
        id: idx,
        images: [],
        seeds: seeds,
      }));
      setGeneratedImages(restoredImages);
    } else {
      setGeneratedImages([]);
    }

    // 오디오 옵션 복원 (저장된 값 또는 기본값)
    if (item.audioOptions) {
      setAudioOptions(item.audioOptions);
    } else {
      setAudioOptions({
        enableMusic: false,
        musicStyle: "cinematic",
        customMusicStyle: "",
        musicMood: "epic",
        enableSoundEffects: false,
        soundEffectTypes: [],
        enableNarration: false,
        narrationStyle: "documentary",
        narrationVoice: "male",
        narrationLanguage: "korean",
      });
    }

    // 현재 작업 중인 주제 ID 설정 및 편집 모드로 전환
    setCurrentTopicId(item.id);
    setTopicMode("edit");

    console.log("히스토리에서 로드:", {
      topic: item.topic,
      topicId: item.id,
      hasStyleOptions: !!item.styleOptions,
      loadedGenre: item.styleOptions?.genre,
      loadedMood: item.styleOptions?.mood,
      loadedVisualStyle: item.styleOptions?.visualStyle,
    });
  };

  // 새 주제 시작 함수
  const startNewTopic = () => {
    // 모든 상태 초기화
    setTopic("");
    setTopicBackground("");
    setTopicMood("");
    setTopicScenes("");
    setTopicStoryline("");
    setTopicSpecial("");
    setStyleOptions({
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
    setCustomGenre("");
    setCustomMood("");
    setSelectedCharacters([]);
    setImagePrompts([]);
    setGeneratedImages([]);
    setAudioOptions({
      enableMusic: false,
      musicStyle: "cinematic",
      customMusicStyle: "",
      musicMood: "epic",
      enableSoundEffects: false,
      soundEffectTypes: [],
      enableNarration: false,
      narrationStyle: "documentary",
      narrationVoice: "male",
      narrationLanguage: "korean",
    });

    // 새 주제이므로 ID는 null, 편집 모드로 전환
    setCurrentTopicId(null);
    setTopicMode("edit");

    // 스타일 옵션 패널 열기
    setShowStyleOptions(true);
    setActiveStyleTab("basic");
  };

  // 현재 주제 명시적 저장 함수
  const saveCurrentTopic = () => {
    if (!topic.trim()) return;

    // localStorage에서 현재 히스토리 읽기
    let currentHistory: TopicHistory[] = [];
    try {
      const savedHistory = localStorage.getItem("topicHistory");
      if (savedHistory) {
        currentHistory = JSON.parse(savedHistory);
      }
    } catch (e) {
      console.error("Failed to parse topic history:", e);
    }

    const now = new Date().toISOString();
    let updatedHistory: TopicHistory[];

    if (currentTopicId) {
      // 기존 항목 업데이트
      updatedHistory = currentHistory.map((item) =>
        item.id === currentTopicId
          ? {
              ...item,
              topic,
              background: topicBackground,
              mood: topicMood,
              scenes: topicScenes,
              storyline: topicStoryline,
              special: topicSpecial,
              styleOptions,
              customGenre,
              customMood,
              characterIds: selectedCharacters.map((c) => c.id),
              audioOptions,
              updatedAt: now,
            }
          : item
      );
      console.log("기존 주제 업데이트:", { id: currentTopicId, styleOptions });
    } else {
      // 새 항목 추가
      const newId = Date.now().toString();
      const newHistory: TopicHistory = {
        id: newId,
        topic,
        background: topicBackground,
        mood: topicMood,
        scenes: topicScenes,
        storyline: topicStoryline,
        special: topicSpecial,
        styleOptions,
        customGenre,
        customMood,
        characterIds: selectedCharacters.map((c) => c.id),
        audioOptions,
        createdAt: now,
        updatedAt: now,
        favorite: false,
      };
      updatedHistory = [newHistory, ...currentHistory].slice(0, 30);
      setCurrentTopicId(newId); // 새 ID 설정
      console.log("새 주제 저장:", { id: newId, styleOptions });
    }

    setTopicHistory(updatedHistory);
    localStorage.setItem("topicHistory", JSON.stringify(updatedHistory));

    // 저장 알림 (토스트 대신 콘솔)
    console.log("주제가 저장되었습니다:", topic);
  };

  // 선택 화면으로 돌아가기
  const backToTopicSelect = () => {
    setTopicMode("select");
  };

  // 주제 히스토리 삭제
  const deleteTopicFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 버튼 클릭 시 부모 요소 클릭 방지
    if (!confirm("이 주제를 삭제하시겠습니까?")) return;
    const updatedHistory = topicHistory.filter((item) => item.id !== id);
    setTopicHistory(updatedHistory);
    localStorage.setItem("topicHistory", JSON.stringify(updatedHistory));
    // 현재 편집 중인 주제가 삭제된 경우 초기화
    if (currentTopicId === id) {
      setCurrentTopicId(null);
    }
  };

  // 주제 히스토리 즐겨찾기 토글
  const toggleTopicFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = topicHistory.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    setTopicHistory(updatedHistory);
    localStorage.setItem("topicHistory", JSON.stringify(updatedHistory));
  };

  // 이미지 시드와 프롬프트를 토픽 히스토리에 저장
  const saveImageSeedsToHistory = (seeds: number[][], prompts: ImagePrompt[]) => {
    if (!topic.trim()) return;

    const existingIndex = topicHistory.findIndex(
      (item) => item.topic.trim().toLowerCase() === topic.trim().toLowerCase()
    );

    let updatedHistory: TopicHistory[];

    if (existingIndex !== -1) {
      // 기존 항목에 시드와 프롬프트, 오디오 옵션 추가
      updatedHistory = topicHistory.map((item, index) =>
        index === existingIndex
          ? { ...item, imageSeeds: seeds, imagePrompts: prompts, audioOptions }
          : item
      );
    } else {
      // 새 항목 생성 (기본값 포함)
      const newHistory: TopicHistory = {
        id: Date.now().toString(),
        topic,
        background: topicBackground,
        mood: topicMood,
        scenes: topicScenes,
        storyline: topicStoryline,
        special: topicSpecial,
        styleOptions,
        customGenre,
        customMood,
        characterIds: selectedCharacters.map((c) => c.id),
        imageSeeds: seeds,
        imagePrompts: prompts,
        audioOptions,
        createdAt: new Date().toISOString(),
        favorite: false,
      };
      updatedHistory = [newHistory, ...topicHistory].slice(0, 30);
    }

    setTopicHistory(updatedHistory);
    localStorage.setItem("topicHistory", JSON.stringify(updatedHistory));
  };

  // 정렬된 히스토리 (즐겨찾기 먼저, 그 다음 최신순)
  const sortedTopicHistory = [...topicHistory].sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 커스텀 스타일 옵션 CRUD 함수들
  const openAddStyleOptionModal = (type: StyleOptionType) => {
    setStyleOptionForm({ type, name: "", description: "", icon: "🎬" });
    setEditingStyleOption(null);
    setShowStyleOptionModal(true);
  };

  const openEditStyleOptionModal = (option: StyleOption) => {
    setStyleOptionForm({
      type: option.type as StyleOptionType,
      name: option.name,
      description: option.description || "",
      icon: option.icon || "🎬",
    });
    setEditingStyleOption(option);
    setShowStyleOptionModal(true);
  };

  const saveStyleOption = async () => {
    if (!styleOptionForm.name.trim()) return;

    try {
      if (editingStyleOption) {
        // 수정
        const res = await fetch("/api/style-options", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingStyleOption.id,
            name: styleOptionForm.name,
            description: styleOptionForm.description,
            icon: styleOptionForm.icon,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setDbStyleOptions(
            dbStyleOptions.map((opt) =>
              opt.id === editingStyleOption.id ? data.option : opt
            )
          );
        }
      } else {
        // 추가
        const res = await fetch("/api/style-options", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: styleOptionForm.type,
            optionId: styleOptionForm.name,
            name: styleOptionForm.name,
            description: styleOptionForm.description,
            icon: styleOptionForm.icon,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setDbStyleOptions([...dbStyleOptions, data.option]);
        }
      }
      setShowStyleOptionModal(false);
    } catch (error) {
      console.error("Style option save error:", error);
    }
  };

  const deleteStyleOption = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/style-options?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDbStyleOptions(dbStyleOptions.filter((opt) => opt.id !== id));
      }
    } catch (error) {
      console.error("Style option delete error:", error);
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

  // 프리셋 수정 모달 열기
  const openEditPresetModal = (preset: UserStylePreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description || "");
    setPresetIcon(preset.icon || "🎬");
    setShowSavePresetModal(true);
  };

  // 프리셋 수정
  const updateUserPreset = async () => {
    if (!editingPreset || !presetName) return;

    try {
      const res = await fetch(`/api/style-presets/${editingPreset.id}`, {
        method: "PUT",
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
        setUserPresets(userPresets.map(p => p.id === data.id ? data : p));
        setShowSavePresetModal(false);
        setEditingPreset(null);
        setPresetName("");
        setPresetDescription("");
        setPresetIcon("🎬");
        alert("프리셋이 수정되었습니다!");
      }
    } catch {
      setError("프리셋 수정에 실패했습니다.");
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

  // 이미지용 스타일 프롬프트 (정적 요소만 - 구도, 앵글, 샷 크기)
  // 상세 스타일 가이드 생성 (장르, 분위기, 비주얼, 컬러 등 모든 정보 포함)
  const generateDetailedStyleGuide = (): string => {
    const genre = VIDEO_GENRES.find(g => g.id === styleOptions.genre);
    const mood = VIDEO_MOODS.find(m => m.id === styleOptions.mood);
    const visual = VISUAL_STYLES.find(v => v.id === styleOptions.visualStyle);
    const colorGrade = COLOR_GRADES.find(c => c.id === styleOptions.colorGrade);
    const timeSetting = TIME_SETTINGS.find(t => t.id === styleOptions.timeSetting);
    const format = VIDEO_FORMATS.find(f => f.id === styleOptions.format);
    const duration = VIDEO_DURATIONS.find(d => d.id === styleOptions.duration);

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    【 상세 스타일 가이드 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 장르 (Genre)
━━━━━━━━━━━━━━━━━━━━━━━
${genre ? `• 선택된 장르: ${genre.icon} ${genre.name}
• 장르 특성: ${genre.description}
• 이 장르는 ${genre.id === 'cinematic' ? '영화적 서사와 깊이 있는 스토리텔링, 극적인 조명과 구도' :
  genre.id === 'action' ? '빠른 컷, 역동적인 카메라 움직임, 긴장감 넘치는 시퀀스' :
  genre.id === 'horror' ? '불안한 앵글, 어두운 조명, 갑작스러운 전환, 공포 유발 요소' :
  genre.id === 'comedy' ? '밝은 조명, 과장된 표정, 유머러스한 타이밍' :
  genre.id === 'romance' ? '따뜻한 색감, 소프트 포커스, 감성적인 클로즈업' :
  genre.id === 'drama' ? '감정에 집중하는 클로즈업, 서정적인 페이싱' :
  genre.id === 'sci-fi' ? '미래적 디자인, 네온 조명, 기술적 요소' :
  genre.id === 'fantasy' ? '마법적 효과, 환상적인 색감, 초자연적 요소' :
  genre.id === 'noir' ? '강한 명암 대비, 실루엣, 그림자 활용' :
  genre.id === 'documentary' ? '사실적 촬영, 자연광, 인터뷰 스타일' :
  '해당 장르의 전형적인 시각 요소'}를 특징으로 합니다.` : '장르 미선택'}

■ 분위기/무드 (Mood)
━━━━━━━━━━━━━━━━━━━━━━━
${mood ? `• 선택된 분위기: ${mood.icon} ${mood.name}
• 분위기 특성: ${mood.description}
• 이 분위기를 표현하기 위해 ${mood.id === 'epic' ? '웅장한 스케일, 드라마틱한 조명, 영웅적 앵글' :
  mood.id === 'calm' ? '부드러운 조명, 여유로운 페이싱, 자연 요소' :
  mood.id === 'energetic' ? '빠른 컷, 강렬한 색상, 역동적 움직임' :
  mood.id === 'romantic' ? '따뜻한 색온도, 소프트 포커스, 친밀한 거리' :
  mood.id === 'mysterious' ? '어두운 조명, 실루엣, 부분 조명' :
  mood.id === 'nostalgic' ? '빈티지 색감, 필름 그레인, 레트로 요소' :
  mood.id === 'dark' ? '저조도, 강한 그림자, 불안한 구도' :
  mood.id === 'tense' ? '타이트한 프레이밍, 불안정한 앵글, 긴박한 컷' :
  mood.id === 'dreamy' ? '흐릿한 배경, 파스텔 톤, 몽환적 효과' :
  '해당 분위기에 맞는 시각 요소'}를 사용하세요.` : '분위기 미선택'}

■ 비주얼 스타일 (Visual Style)
━━━━━━━━━━━━━━━━━━━━━━━
${visual ? `• 선택된 스타일: ${visual.icon} ${visual.name}
• 스타일 특성: ${visual.description}
• 렌더링 지침:
  ${visual.id === 'realistic' ? '- 사실적인 질감과 디테일\n  - 자연스러운 조명과 그림자\n  - 포토리얼리스틱 렌더링\n  - 실제 카메라로 촬영한 듯한 품질' :
  visual.id === 'cartoon' ? '- 굵은 외곽선과 단순화된 형태\n  - 평면적인 색상 처리\n  - 만화적 과장과 표현\n  - 선명한 색상 대비' :
  visual.id === 'anime' ? '- 큰 눈과 특징적인 캐릭터 비율\n  - 생동감 있는 머리카락 표현\n  - 일본 애니메이션 특유의 색감\n  - 감정 표현을 위한 이펙트' :
  visual.id === 'vintage' ? '- 필름 그레인 효과\n  - 바랜 색감\n  - 비네팅 효과\n  - 레트로 색온도' :
  visual.id === 'minimalist' ? '- 단순한 구성\n  - 여백의 활용\n  - 제한된 색상 팔레트\n  - 깔끔한 라인' :
  visual.id === 'vibrant' ? '- 높은 채도\n  - 화려한 색상 조합\n  - 강렬한 시각적 임팩트\n  - 선명한 대비' :
  visual.id === 'monochrome' ? '- 흑백 또는 단색 처리\n  - 톤의 미묘한 변화\n  - 강조를 위한 명암 대비\n  - 클래식한 분위기' :
  visual.id === 'soft-focus' ? '- 부드러운 초점\n  - 낮은 대비\n  - 로맨틱한 분위기\n  - 피부톤 보정' :
  '- 해당 스타일의 시각적 특징을 반영'}` : '비주얼 스타일 미선택'}

■ 색보정/컬러그레이딩 (Color Grade)
━━━━━━━━━━━━━━━━━━━━━━━
${colorGrade ? `• 선택된 컬러: ${colorGrade.icon} ${colorGrade.name}
• 컬러 특성: ${colorGrade.description}
• 색보정 상세 지침:
  ${colorGrade.id === 'natural' ? '- 자연스러운 색감 유지\n  - 과도한 보정 지양\n  - 현실적인 스킨톤\n  - 균형 잡힌 화이트 밸런스' :
  colorGrade.id === 'warm' ? '- 오렌지/황금색 색조 추가\n  - 따뜻한 색온도 (약 5500-6500K)\n  - 황금빛 하이라이트\n  - 붉은 계열 강조' :
  colorGrade.id === 'cool' ? '- 청색/시안 색조 추가\n  - 차가운 색온도 (약 7000-9000K)\n  - 푸른빛 하이라이트\n  - 파란 계열 강조' :
  colorGrade.id === 'teal-orange' ? '- 그림자에 틸(청록) 색조\n  - 하이라이트에 오렌지 색조\n  - 피부톤은 따뜻하게 유지\n  - 할리우드 블록버스터 느낌' :
  colorGrade.id === 'desaturated' ? '- 전체 채도 30-50% 감소\n  - 회색빛이 도는 색감\n  - 무드있는 분위기\n  - 부드러운 색상 전환' :
  colorGrade.id === 'high-saturation' ? '- 채도 20-40% 증가\n  - 선명하고 화려한 색상\n  - 강렬한 시각적 임팩트\n  - 밝고 생동감 있는 느낌' :
  colorGrade.id === 'sepia' ? '- 갈색/황토색 오버레이\n  - 오래된 사진 느낌\n  - 따뜻한 빈티지 톤\n  - 부드러운 대비' :
  colorGrade.id === 'bleach-bypass' ? '- 저채도 + 높은 대비\n  - 은잔류 효과\n  - 거친 질감\n  - 어두운 분위기' :
  colorGrade.id === 'cyberpunk' ? '- 네온 핑크와 청록색\n  - 강렬한 색상 대비\n  - 어두운 배경에 밝은 하이라이트\n  - 미래적이고 디지털한 느낌' :
  colorGrade.id === 'kodak-portra' ? '- 부드러운 피부톤\n  - 자연스러운 색 재현\n  - 약간의 필름 그레인\n  - 따뜻하고 부드러운 하이라이트' :
  colorGrade.id === 'noir' || colorGrade.id === 'bw-film-noir' ? '- 강한 흑백 대비\n  - 깊은 그림자\n  - 드라마틱한 조명\n  - 1940년대 느와르 영화 스타일' :
  '- 해당 컬러그레이딩의 특성 적용'}` : '컬러그레이딩 미선택'}

■ 시간대/환경 (Time Setting)
━━━━━━━━━━━━━━━━━━━━━━━
${timeSetting ? `• 선택된 시간대: ${timeSetting.icon} ${timeSetting.name}
• 시간대 특성: ${timeSetting.description}
• 조명 지침:
  ${timeSetting.id === 'dawn' ? '- 부드러운 파란빛에서 분홍빛으로 전환\n  - 안개 낀 대기\n  - 길게 늘어진 그림자\n  - 조용하고 신비로운 분위기' :
  timeSetting.id === 'golden-hour' ? '- 황금빛 따뜻한 조명\n  - 길고 부드러운 그림자\n  - 강렬하지 않은 역광 가능\n  - 피부톤이 아름답게 보임' :
  timeSetting.id === 'blue-hour' ? '- 깊은 푸른빛 하늘\n  - 인공 조명과의 대비\n  - 신비롭고 차분한 분위기\n  - 도시 야경과 잘 어울림' :
  timeSetting.id === 'night' ? '- 어두운 배경\n  - 인공 조명 강조\n  - 높은 명암 대비\n  - 네온, 가로등 등 광원 활용' :
  timeSetting.id === 'noon' ? '- 직사광선, 강한 그림자\n  - 높은 대비\n  - 선명한 색상\n  - 머리 위에서 내려오는 빛' :
  '- 해당 시간대의 자연광 특성 반영'}` : '시간대 미선택'}

■ 영상 형식 (Format)
━━━━━━━━━━━━━━━━━━━━━━━
${format ? `• 화면비: ${format.aspectRatio}
• 형식 이름: ${format.name}
• 형식 특성: ${format.description}
• 구도 지침: ${format.aspectRatio === '9:16' ? '세로 프레임에 맞춰 인물 중심 구도, 상하 공간 활용' :
  format.aspectRatio === '16:9' ? '가로 프레임 활용, 좌우 공간과 배경 활용' :
  format.aspectRatio === '1:1' ? '정사각형 프레임, 중앙 집중형 구도' :
  format.aspectRatio === '2.35:1' ? '시네마틱 와이드, 파노라마 구도, 좌우 여백 활용' :
  '해당 화면비에 맞는 구도 설계'}` : '형식 미선택'}

■ 목표 길이 (Duration)
━━━━━━━━━━━━━━━━━━━━━━━
${duration ? `• 목표 길이: ${duration.name} (${duration.seconds}초)
• 길이 특성: ${duration.description}` : '길이 미선택'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  };

  const generateImageStylePrompt = (settings: SceneSettings): string => {
    const cameraAngle = CAMERA_ANGLES.find(c => c.id === settings.cameraAngle);
    const shotSize = SHOT_SIZES.find(s => s.id === settings.shotSize);
    const colorGrade = COLOR_GRADES.find(c => c.id === styleOptions.colorGrade);
    const visual = VISUAL_STYLES.find(v => v.id === styleOptions.visualStyle);
    const timeSetting = TIME_SETTINGS.find(t => t.id === styleOptions.timeSetting);

    return `
【이미지 촬영 구도 상세】
━━━━━━━━━━━━━━━━━━━━━━━
• 카메라 앵글: ${cameraAngle?.name} - ${cameraAngle?.description}
  → 이 앵글로 촬영하면 ${cameraAngle?.id === 'eye-level' ? '자연스럽고 친근한 느낌' :
    cameraAngle?.id === 'low-angle' ? '피사체가 웅장하고 강력해 보임' :
    cameraAngle?.id === 'high-angle' ? '피사체가 작고 취약해 보임' :
    cameraAngle?.id === 'dutch-angle' ? '불안하고 긴장감 있는 느낌' :
    cameraAngle?.id === 'birds-eye' ? '전체 상황을 내려다보는 신의 시점' :
    '해당 앵글의 특성'}이 표현됨

• 샷 크기: ${shotSize?.name} - ${shotSize?.description}
  → ${shotSize?.id === 'extreme-wide' ? '배경과 환경 전체가 보이는 광활한 구도' :
    shotSize?.id === 'wide' ? '인물과 배경이 함께 보이는 넓은 구도' :
    shotSize?.id === 'full' ? '인물 전신이 프레임에 담김' :
    shotSize?.id === 'medium' ? '허리 위로 보이며 대화 장면에 적합' :
    shotSize?.id === 'close-up' ? '얼굴 표정과 감정에 집중' :
    shotSize?.id === 'extreme-close' ? '눈, 입 등 극도로 세밀한 부분 강조' :
    '해당 샷 크기의 특성'}

• 비주얼 스타일: ${visual?.name} - ${visual?.description}
• 색보정: ${colorGrade?.name} - ${colorGrade?.description}
• 시간대 조명: ${timeSetting?.name} - ${timeSetting?.description}
    `.trim();
  };

  // 비디오용 스타일 프롬프트 (동적 요소 - 카메라 움직임, 전환, 페이싱)
  const generateVideoStylePrompt = (settings: SceneSettings): string => {
    const cameraAngle = CAMERA_ANGLES.find(c => c.id === settings.cameraAngle);
    const shotSize = SHOT_SIZES.find(s => s.id === settings.shotSize);
    const cameraMovement = CAMERA_MOVEMENTS.find(c => c.id === settings.cameraMovement);
    const transition = TRANSITION_STYLES.find(t => t.id === settings.transitionStyle);
    const pacing = PACING_OPTIONS.find(p => p.id === settings.pacing);

    return `
【영상 연출 상세】
━━━━━━━━━━━━━━━━━━━━━━━
• 시작 구도: ${cameraAngle?.name} + ${shotSize?.name}

• 카메라 움직임: ${cameraMovement?.name}
  → 상세: ${cameraMovement?.description}
  → 연출 팁: ${cameraMovement?.id === 'static' ? '안정적이고 정적인 장면에 적합, 대사나 감정에 집중' :
    cameraMovement?.id === 'pan' ? '좌에서 우 또는 우에서 좌로 천천히 회전하며 공간을 보여줌' :
    cameraMovement?.id === 'tilt' ? '위에서 아래 또는 아래에서 위로 회전하며 피사체를 따라감' :
    cameraMovement?.id === 'zoom-in' ? '서서히 확대하며 중요한 디테일이나 감정에 집중' :
    cameraMovement?.id === 'dolly-in' ? '카메라가 물리적으로 전진하며 친밀감 증가' :
    cameraMovement?.id === 'tracking' ? '피사체를 옆에서 따라가며 움직임 강조' :
    cameraMovement?.id === 'crane-up' ? '위로 올라가며 웅장함 연출' :
    cameraMovement?.id === 'handheld' ? '손 떨림으로 현장감과 긴박감 연출' :
    cameraMovement?.id === 'steadicam' ? '부드럽게 따라가며 몰입감 유지' :
    cameraMovement?.id === 'arc' ? '피사체 주위를 원형으로 돌며 입체감 연출' :
    '해당 움직임의 연출 효과'}

• 장면 전환: ${transition?.name}
  → 상세: ${transition?.description}
  → 연출 팁: ${transition?.id === 'cut' ? '즉각적 전환으로 긴장감이나 빠른 페이스 연출' :
    transition?.id === 'fade' ? '서서히 사라지고 나타나며 시간 경과나 장소 변화 표현' :
    transition?.id === 'dissolve' ? '두 장면이 겹치며 연결성 강조' :
    transition?.id === 'wipe' ? '방향성 있는 전환으로 에너지 전달' :
    transition?.id === 'whip-pan' ? '빠른 패닝으로 에너지 넘치는 전환' :
    transition?.id === 'match-cut' ? '비슷한 형태로 자연스럽게 연결' :
    '해당 전환의 연출 효과'}

• 템포/페이싱: ${pacing?.name}
  → 상세: ${pacing?.description}
  → 컷 빈도: ${pacing?.id === 'very-slow' ? '긴 테이크, 5-10초 이상의 샷' :
    pacing?.id === 'slow' ? '여유로운 3-5초 샷' :
    pacing?.id === 'moderate' ? '균형잡힌 2-3초 샷' :
    pacing?.id === 'fast' ? '빠른 1-2초 샷' :
    pacing?.id === 'very-fast' ? '0.5-1초의 빠른 컷' :
    '상황에 맞는 컷 빈도'}
    `.trim();
  };

  // 이미지 생성 API 호출 (재시도 로직 포함)
  const generateImageWithRetry = async (
    body: Record<string, unknown>,
    maxRetries: number = 3,
    frameLabel: string = ""
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    let lastError = "";
    const currentBody = { ...body };
    let triedWithoutRefImages = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          setLoadingStep(`${frameLabel} 재시도 중... (${attempt}/${maxRetries})`);
          // 재시도 전 대기 (2초, 4초, 8초...)
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }

        const res = await fetch("/api/generate/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentBody),
        });
        const data = await res.json();

        if (data.success) {
          return { success: true, url: data.url };
        }

        // 재시도 가능한 에러인지 확인
        const errorMsg = data.error || "알 수 없는 오류";
        lastError = errorMsg;

        // E006 오류 (invalid input)는 주로 참조 이미지 문제 - 참조 이미지 없이 재시도
        if (errorMsg.includes("E006") && currentBody.referenceImages && !triedWithoutRefImages) {
          console.log(`${frameLabel}: E006 오류 발생 - 참조 이미지 없이 재시도...`);
          setLoadingStep(`${frameLabel} 참조 이미지 없이 재시도 중...`);
          triedWithoutRefImages = true;
          delete currentBody.referenceImages;
          // attempt 카운트는 증가하지만 재시도 대기는 짧게
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        const isRetryableError =
          errorMsg.includes("temporarily unavailable") ||
          errorMsg.includes("E004") ||
          errorMsg.includes("E006") ||
          errorMsg.includes("rate limit") ||
          errorMsg.includes("timeout") ||
          errorMsg.includes("503") ||
          errorMsg.includes("500") ||
          errorMsg.includes("Prediction failed") ||
          errorMsg.includes("null") ||
          errorMsg.includes("failed") ||
          errorMsg.includes("unavailable");

        if (!isRetryableError || attempt === maxRetries) {
          return { success: false, error: errorMsg };
        }

        console.log(`${frameLabel}: ${attempt}번째 시도 실패 (${errorMsg}), 재시도 중...`);
      } catch (err) {
        lastError = err instanceof Error ? err.message : "네트워크 오류";
        if (attempt === maxRetries) {
          return { success: false, error: lastError };
        }
        console.log(`${frameLabel}: 네트워크 오류, 재시도 중...`);
      }
    }
    return { success: false, error: lastError };
  };

  // 캐릭터 정보 프롬프트 생성 함수 - 이미지 기반
  const generateCharacterPrompt = (): string => {
    if (selectedCharacters.length === 0) return "";

    // 캐릭터별 참조 이미지 번호 매핑 계산
    let imageIndex = 1;
    const characterImageMapping: { name: string; imageRange: string; hasImages: boolean }[] = [];

    selectedCharacters.forEach((char) => {
      const uploadedCount = Math.min((char.referenceImages || []).length, 4);
      const generatedCount = Math.min((char.generatedImages || []).filter(img =>
        img && (img.includes('replicate.delivery') || img.includes('replicate.com'))
      ).length, 2);
      const totalImages = uploadedCount + generatedCount;

      if (totalImages > 0) {
        const startIdx = imageIndex;
        const endIdx = imageIndex + totalImages - 1;
        characterImageMapping.push({
          name: char.name,
          imageRange: totalImages === 1 ? `Image ${startIdx}` : `Image ${startIdx}-${endIdx}`,
          hasImages: true
        });
        imageIndex += totalImages;
      } else {
        characterImageMapping.push({
          name: char.name,
          imageRange: "없음",
          hasImages: false
        });
      }
    });

    // 이미지가 있는 캐릭터만 필터링
    const charsWithImages = selectedCharacters.filter((_, idx) => characterImageMapping[idx].hasImages);

    if (charsWithImages.length === 0) return "";

    // 캐릭터 이미지 참조 목록 생성
    const characterList = charsWithImages.map((char) => {
      const mapping = characterImageMapping[selectedCharacters.indexOf(char)];
      const roleLabel = char.role === "주인공" ? "★주인공" : char.role || "등장인물";
      return `• ${char.name} (${roleLabel}): ${mapping.imageRange}`;
    }).join("\n");

    // 주인공 찾기
    const protagonist = charsWithImages.find(c => c.role === "주인공");
    const protagonistMapping = protagonist ? characterImageMapping.find(m => m.name === protagonist.name) : null;

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎭 등장인물 (참조 이미지 기반으로만 외모 묘사)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${characterList}
${protagonist && protagonistMapping ? `
🚨 주인공: ${protagonist.name} (${protagonistMapping.imageRange})
- 모든 장면에서 주인공의 외모는 ${protagonistMapping.imageRange}를 기준으로 하세요.
` : ""}
⚠️ 필수 지침:
1. 캐릭터 외모는 절대 텍스트로 묘사하지 마세요! 무조건 참조 이미지 번호만 사용!
2. 예시: "${protagonist?.name || charsWithImages[0]?.name}(${protagonistMapping?.imageRange || characterImageMapping[0]?.imageRange})가 방에 들어온다" - 이렇게 이미지 번호만 언급
3. 금지: "검은 머리", "하얀 피부", "파란 옷" 등 외모/의상 텍스트 묘사
4. 이미지 생성 시 참조 이미지가 자동으로 전달되므로 텍스트 묘사 불필요
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
  };

  // 이미지 프롬프트용 캐릭터 설명 생성 (더 간결하고 시각적) - reserved for future use
  // const generateCharacterVisualPrompt = (): string => {
  //   if (selectedCharacters.length === 0) return "";
  //
  //   const visuals = selectedCharacters.map((char) => {
  //     const features = [];
  //     if (char.appearance) features.push(char.appearance);
  //     if (char.clothing) features.push(`wearing ${char.clothing}`);
  //     if (char.gender && char.age) features.push(`${char.gender}, ${char.age}`);
  //     return features.length > 0 ? `${char.name || "캐릭터"}: ${features.join(", ")}` : "";
  //   }).filter(Boolean);
  //
  //   return visuals.length > 0 ? `[등장인물: ${visuals.join(" | ")}]` : "";
  // };

  // 캐릭터 선택/해제 함수
  const toggleCharacter = (character: Character) => {
    const isSelected = selectedCharacters.some(c => c.id === character.id);
    if (isSelected) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
      // 모드에서도 제거
      setCharacterImageModes(prev => {
        const newModes = { ...prev };
        delete newModes[character.id];
        return newModes;
      });
    } else {
      setSelectedCharacters([...selectedCharacters, character]);
      // 참조 이미지가 있으면 기본 모드를 "ai_reference"로, 없으면 "ai_create"로 설정
      const hasImages = [...(character.referenceImages || []), ...(character.generatedImages || [])].length > 0;
      setCharacterImageModes(prev => ({
        ...prev,
        [character.id]: hasImages ? "ai_reference" : "ai_create"
      }));
    }
  };

  // 캐릭터 이미지 모드 변경 함수
  const setCharacterImageMode = (characterId: string, mode: "attached" | "ai_reference" | "ai_create") => {
    setCharacterImageModes(prev => ({
      ...prev,
      [characterId]: mode
    }));
  };

  const generateScript = async () => {
    if (!apiKey || !topic) return;

    setLoading(true);
    setError(null);

    const _styleGuide = generateStylePrompt(styleOptions, customGenre, customMood);
    void _styleGuide; // reserved for future use in script generation
    const characterGuide = generateCharacterPrompt();

    console.log("[스크립트 생성] 캐릭터 정보:", {
      selectedCharactersCount: selectedCharacters.length,
      selectedCharacterNames: selectedCharacters.map(c => c.name),
      characterGuideLength: characterGuide.length,
      characterGuidePreview: characterGuide.substring(0, 200),
    });

    try {
      // 1단계: AI에게 각 장면별 촬영 설정 추천 요청
      setLoadingStep("장면별 촬영 설정 분석 중...");

      const cameraAngles = CAMERA_ANGLES.map(a => a.id).join(", ");
      const shotSizes = SHOT_SIZES.map(s => s.id).join(", ");
      const cameraMovements = CAMERA_MOVEMENTS.map(c => c.id).join(", ");
      const transitionStyles = TRANSITION_STYLES.map(t => t.id).join(", ");
      const pacingOptions = PACING_OPTIONS.map(p => p.id).join(", ");

      const settingsRes = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: textModel,
          prompt: `당신은 전문 영화 감독입니다. 주어진 영상 기획을 분석하고 각 장면에 최적화된 촬영 설정을 추천하세요.

=== 영상 기획 ===
주제: ${topic}
${topicBackground ? `배경: ${topicBackground}` : ""}
${topicMood ? `분위기: ${topicMood}` : ""}
${topicScenes ? `주요 장면: ${topicScenes}` : ""}
${topicStoryline ? `줄거리: ${topicStoryline}` : ""}
${topicSpecial ? `특별 요청: ${topicSpecial}` : ""}

총 장면 수: ${sceneCount}장면

=== 사용 가능한 옵션 ===
카메라 앵글: ${cameraAngles}
샷 크기: ${shotSizes}
카메라 움직임: ${cameraMovements}
전환 효과: ${transitionStyles}
페이싱: ${pacingOptions}

각 장면마다 스토리 전개와 분위기에 맞는 촬영 설정을 JSON 배열로 반환하세요.
- 오프닝 장면: 와이드샷으로 배경 소개
- 클라이맥스: 클로즈업과 역동적인 카메라 움직임
- 엔딩: 감정에 맞는 페이싱과 전환 효과

반드시 아래 JSON 형식으로만 응답하세요:
[
  {"scene": 1, "cameraAngle": "eye-level", "shotSize": "wide", "cameraMovement": "dolly-in", "transitionStyle": "fade", "pacing": "slow"},
  {"scene": 2, "cameraAngle": "low-angle", "shotSize": "medium", "cameraMovement": "tracking", "transitionStyle": "cut", "pacing": "moderate"}
]`,
        }),
      });

      let sceneSettingsArray: SceneSettings[] = [];
      const settingsData = await settingsRes.json();

      if (settingsData.success) {
        try {
          // JSON 파싱 시도
          const jsonMatch = settingsData.text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            sceneSettingsArray = parsed.map((s: { cameraAngle?: string; shotSize?: string; cameraMovement?: string; transitionStyle?: string; pacing?: string }) => ({
              cameraAngle: s.cameraAngle || defaultSceneSettings.cameraAngle,
              shotSize: s.shotSize || defaultSceneSettings.shotSize,
              cameraMovement: s.cameraMovement || defaultSceneSettings.cameraMovement,
              transitionStyle: s.transitionStyle || defaultSceneSettings.transitionStyle,
              pacing: s.pacing || defaultSceneSettings.pacing,
            }));
          }
        } catch {
          console.log("AI 촬영 설정 파싱 실패, 기본값 사용");
        }
      }

      // 설정이 부족하면 기본값으로 채우기
      while (sceneSettingsArray.length < sceneCount) {
        sceneSettingsArray.push({ ...defaultSceneSettings });
      }

      console.log("AI 추천 촬영 설정:", sceneSettingsArray);

      // 스크립트 생성 시작 - 먼저 step을 script로 변경하여 결과를 실시간으로 볼 수 있게
      setStep("script");
      setImagePrompts([]); // 기존 프롬프트 초기화

      // 상세 스타일 가이드 생성
      const detailedStyleGuide = generateDetailedStyleGuide();

      for (let i = 0; i < sceneCount; i++) {
        setLoadingStep(`장면 ${i + 1}/${sceneCount} 스크립트 생성 중...`);

        // AI가 추천한 장면별 설정 사용
        const sceneSettings: SceneSettings = sceneSettingsArray[i] || { ...defaultSceneSettings };
        // 이미지용: 정적 요소만 (앵글, 샷 크기)
        const imageStyleGuide = generateImageStylePrompt(sceneSettings);
        // 비디오용: 동적 요소 (카메라 움직임, 전환, 페이싱)
        const videoStyleGuide = generateVideoStylePrompt(sceneSettings);

        const sceneRes = await fetch("/api/generate/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            model: textModel,
            prompt: `당신은 세계적인 영화감독이자 시네마토그래퍼입니다. AI 영상 생성 모델(Veo 3.1, Sora, Runway Gen-3)을 위한 최고 품질의 상세 프롬프트를 작성합니다.

**★★★ 최우선 지침 ★★★**
1. 모든 응답은 반드시 한글로 작성하세요. 단, 숫자는 아라비아 숫자(1, 2, 3...)로 표기하세요. 영어 단어 사용 금지.
2. 각 프롬프트는 매우 길고 상세하게 작성하세요 (최소 150단어 이상).
3. 모든 시각적 요소를 구체적인 수치와 방향으로 명시하세요.
4. 🚨 등장인물은 첨부된 참조 이미지만 기반으로 묘사하세요. 외모나 의상을 텍스트로 상세히 묘사하지 말고, 이미지 번호만 언급하세요!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 【 영상 기획 정보 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 주제: ${topic}
${topicBackground ? `• 배경 설정: ${topicBackground}` : ""}
${topicMood ? `• 원하는 분위기: ${topicMood}` : ""}
${topicScenes ? `• 주요 장면 구상: ${topicScenes}` : ""}
${topicStoryline ? `• 스토리 줄거리: ${topicStoryline}` : ""}
${topicSpecial ? `• 특별 요청사항: ${topicSpecial}` : ""}

${characterGuide ? `${characterGuide}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         【 현재 작업: 장면 ${i + 1} / 총 ${sceneCount}장면 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${i === 0 ? "▶ 오프닝 장면: 시청자의 관심을 사로잡는 강렬한 첫인상" :
  i === sceneCount - 1 ? "▶ 엔딩 장면: 여운과 감동을 남기는 마무리" :
  i === Math.floor(sceneCount / 2) ? "▶ 클라이맥스 장면: 감정의 정점, 가장 인상적인 순간" :
  `▶ 전개 장면: 스토리를 이어가는 중요한 연결고리`}

${detailedStyleGuide}

${imageStyleGuide}

${videoStyleGuide}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              【 프롬프트 작성 가이드라인 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ FRAME1, FRAME2 (이미지 프롬프트) 작성 요령:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
각 프레임은 "정지된 한 장의 사진"입니다. 움직임 묘사는 금지!

반드시 포함해야 할 요소:
1. 【조명】 광원 위치(좌상단 45도 등), 광질(부드러운/날카로운), 색온도(따뜻한 황금빛/차가운 푸른빛), 강도(밝음/어둠), 그림자 방향과 깊이
2. 【색감】 전체 색조(따뜻한/차가운/중립), 주요 색상들, 채도(선명/뮤트), 명암 대비 정도, 하이라이트와 섀도우 색상
3. 【구도】 프레임 내 피사체 위치(3분할법, 중앙, 황금비), 전경/중경/배경 레이어, 깊이감, 프레임 내 시선 유도
4. 【인물/피사체】 정확한 위치, 자세, 포즈 (외모/의상은 참조 이미지 번호만 언급, 텍스트로 묘사 금지)
5. 【배경】 장소의 구체적 묘사, 소품들, 텍스처, 재질감, 날씨 상태, 대기 효과(안개/먼지/빛줄기)
6. 【분위기】 전체적인 무드, 감정적 톤, 시각적 분위기

■ VIDEO (비디오 프롬프트) 작성 요령:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
이것은 "움직이는 영상"입니다. 모든 동적 요소를 상세히 묘사!
⚠️ 중요: 캐릭터 외모/의상 묘사 금지! 오직 동작과 카메라 움직임만 묘사!
최소 200단어 이상으로 매우 상세하게 작성하세요!

반드시 포함해야 할 요소:
1. 【피사체 동작】 (외모 묘사 금지! 동작만!)
   - 인물: 걷기/달리기 방향과 속도, 팔다리 움직임, 고개 돌림, 표정 변화
   - 물체: 이동 경로, 회전, 흔들림, 떨어짐 등
   - 구체적 예: "캐릭터가 화면 왼쪽에서 오른쪽으로 천천히 걸어가며, 고개를 돌려 카메라를 바라본다" (외모 묘사 없이!)

2. 【카메라 워크】
   - 움직임 유형: 패닝(좌우)/틸트(상하)/달리(전후)/크레인(수직)/아크(원형)/핸드헬드(흔들림)
   - 속도: 매우 느림(5초 이상)/느림(3-5초)/보통(2-3초)/빠름(1초 미만)
   - 시작점과 끝점: "카메라가 발끝에서 시작해 얼굴까지 천천히 틸트업"
   - 줌: "서서히 줌인하며 얼굴에 집중" 또는 "줌아웃하며 전체 풍경 공개"

3. 【환경 변화】
   - 조명 변화: 해가 지며 황금빛으로 변화, 구름 그림자 이동, 네온 깜빡임
   - 자연 요소: 바람에 휘날리는 머리카락/옷자락/나뭇잎, 물결, 안개 흐름
   - 대기 효과: 먼지 입자, 빛줄기, 연기, 안개

4. 【시간 흐름】
   - 장면 길이: 이 장면이 몇 초 동안 지속되는지
   - 속도 변화: 슬로우모션(0.5배속), 일반(1배속), 패스트모션(2배속)
   - 시간 경과: "하늘이 점점 어두워지며 저녁으로 전환"

5. 【전환 및 연결】
   - 다음 장면으로의 전환 방식
   - 감정의 고조/해소
   - 시각적 리듬과 박자

6. 【오디오 연상】 (시각으로 표현)
   - 소리를 시각적으로 표현: "폭발음에 화면이 흔들림", "발걸음에 맞춰 카메라가 미세하게 흔들림"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    【 응답 형식 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
아래 형식을 정확히 따르세요. 각 섹션은 최소 분량을 지켜주세요.

FRAME1: [시작 프레임 - 정적 이미지 묘사 - 최소 100단어 - 움직임 설명 금지, 오직 정지된 순간만 묘사]

FRAME2: [끝 프레임 - 정적 이미지 묘사 - 최소 100단어 - 움직임 설명 금지, FRAME1과 다른 상태/구도]

VIDEO: [이 장면의 상세한 모션/카메라/환경 변화 묘사 - 최소 200단어 - 위 가이드라인의 모든 요소 포함]`,
          }),
        });

        const sceneData = await sceneRes.json();
        if (sceneData.success) {
          const text = sceneData.text;
          const frame1Match = text.match(/FRAME1:\s*(.+?)(?=FRAME2:|VIDEO:|$)/s);
          const frame2Match = text.match(/FRAME2:\s*(.+?)(?=VIDEO:|$)/s);
          const videoMatch = text.match(/VIDEO:\s*(.+?)$/s);

          const newPrompt: ImagePrompt = {
            id: i,
            prompt1: frame1Match ? frame1Match[1].trim() : "",  // 시작 프레임 (정적)
            prompt2: frame2Match ? frame2Match[1].trim() : "",  // 끝 프레임 (정적)
            prompt3: "",  // Veo 3.1은 2개 프레임만 사용
            videoPrompt: videoMatch ? videoMatch[1].trim() : "",  // 장면별 비디오 모션 프롬프트
            settings: sceneSettings,
          };

          // 각 장면이 생성될 때마다 바로 화면에 표시
          setImagePrompts(prev => [...prev, newPrompt]);
        }
      }

      // 비디오 모션 프롬프트는 장면별로 이미 생성됨 (각 imagePrompts[i].videoPrompt)
      // 전체 합쳐지는 비디오 프롬프트는 제거됨 - 각 장면마다 1개의 videoPrompt만 사용
    } catch {
      setError("스크립트 생성 실패");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // AI로 대사 자동 생성
  const generateDialoguesWithAI = async () => {
    if (!apiKey || imagePrompts.length === 0) return;

    setLoading(true);
    setLoadingStep("AI가 대사를 생성하고 있습니다...");

    try {
      const scenesDescription = imagePrompts.map((scene, idx) =>
        `장면 ${idx + 1}:\n- 시작: ${scene.prompt1}\n- 끝: ${scene.prompt2}`
      ).join("\n\n");

      const prompt = `다음 영상의 각 장면에 어울리는 짧은 대사(말풍선)를 생성해주세요.
대사는 캐릭터가 말하는 것처럼 자연스럽고 짧게 작성해주세요 (한 문장, 10자 이내 권장).

${scenesDescription}

JSON 형식으로 응답해주세요:
{
  "dialogues": [
    {"scene": 1, "dialogue1": "시작 대사", "dialogue2": "끝 대사"},
    ...
  ]
}`;

      const res = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, model: textModel, prompt }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        // JSON 파싱 시도
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.dialogues && Array.isArray(parsed.dialogues)) {
            const updatedPrompts = imagePrompts.map((scene, idx) => {
              const dialogueData = parsed.dialogues.find((d: { scene: number }) => d.scene === idx + 1);
              if (dialogueData) {
                return {
                  ...scene,
                  dialogue1: dialogueData.dialogue1 || "",
                  dialogue2: dialogueData.dialogue2 || "",
                };
              }
              return scene;
            });
            setImagePrompts(updatedPrompts);
          }
        }
      }
    } catch (err) {
      console.error("대사 생성 실패:", err);
      setError("대사 생성에 실패했습니다");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const generateImages = async () => {
    if (!apiKey || imagePrompts.length === 0) return;

    setLoading(true);
    setError(null);

    // 이미지 생성 시작 - 먼저 step을 image로 변경하여 결과를 실시간으로 볼 수 있게
    setStep("image");
    setGeneratedImages([]); // 기존 이미지 초기화

    // 대사를 프롬프트에 추가하는 헬퍼 함수
    const addDialogueToPrompt = (prompt: string, dialogue?: string) => {
      // 대사 옵션이 켜져 있고 대사가 있을 때만 추가
      if (!enableDialogue || !dialogue || dialogue.trim() === "") {
        return prompt;
      }
      return `${prompt}. Include a speech bubble with the text: "${dialogue}"`;
    };

    // 상대 경로를 공개 URL로 변환하는 함수 (Replicate에서 접근 가능하도록)
    const toAbsoluteUrl = (url: unknown): string | null => {
      if (!url || typeof url !== 'string') return null;
      // 이미 절대 URL이면 그대로 반환
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // 프로덕션 공개 도메인 사용 (Replicate가 접근할 수 있어야 함)
      const PUBLIC_DOMAIN = "https://mov.hwasubun.ai";
      // 상대 경로인 경우 공개 URL로 변환
      if (url.startsWith('/')) {
        let publicPath = url;
        // /uploads/ -> /api/uploads/ (API 라우트를 통해 외부에서 접근 가능)
        if (url.includes('/uploads/') && !url.includes('/api/uploads/')) {
          publicPath = url.replace('/uploads/', '/api/uploads/');
        }
        return `${PUBLIC_DOMAIN}${publicPath}`;
      }
      return null;
    };

    // 캐릭터 참조 이미지 수집 (절대 URL로 변환)
    // Replicate에서 생성된 이미지 (replicate.delivery URL)를 우선 사용
    const characterGeneratedImages: string[] = selectedCharacters
      .flatMap(c => c.generatedImages || [])
      .filter(img => img && (img.includes('replicate.delivery') || img.includes('replicate.com')));

    // 업로드된 이미지는 절대 URL로 변환
    const characterUploadedImages: string[] = selectedCharacters
      .flatMap(c => c.referenceImages || [])
      .map(img => toAbsoluteUrl(img))
      .filter((img): img is string => img !== null);

    // Replicate 생성 이미지 우선, 그 다음 업로드 이미지
    const characterReferenceImages: string[] = [
      ...characterGeneratedImages,
      ...characterUploadedImages,
    ].filter((v, i, a) => a.indexOf(v) === i); // 중복 제거

    // 스타일 참조 이미지 (느낌 이미지) - 절대 URL로 변환
    const styleRefImages: string[] = styleReferenceImages
      .map(img => toAbsoluteUrl(img))
      .filter((img): img is string => img !== null);

    console.log(`[참조이미지] 캐릭터 생성 이미지: ${characterGeneratedImages.length}개`, characterGeneratedImages);
    console.log(`[참조이미지] 캐릭터 업로드 이미지: ${characterUploadedImages.length}개`, characterUploadedImages);
    console.log(`[참조이미지] 총 캐릭터 참조 이미지: ${characterReferenceImages.length}개`);
    console.log(`[참조이미지] 스타일 참조 이미지: ${styleRefImages.length}개`, styleRefImages);

    // allImages 배열은 히스토리 저장용으로 사용
    const allImages: { id: number; images: string[]; seeds: number[] }[] = [];

    // 캐릭터 일관성을 위해 이전에 생성된 이미지들 저장
    const previousGeneratedImages: string[] = [];

    try {
      for (let i = 0; i < imagePrompts.length; i++) {
        const scene = imagePrompts[i];
        setLoadingStep(`장면 ${i + 1}/${imagePrompts.length} 이미지 생성 중...`);

        const sceneImages: string[] = [];
        const sceneSeeds: number[] = [];

        // format에 따른 aspectRatio 결정
        const formatConfig = VIDEO_FORMATS.find(f => f.id === styleOptions.format);
        const aspectRatio = formatConfig?.aspectRatio || "16:9";

        // 참조 이미지 구성: Nano Banana Pro용 구조화된 순서
        // 1번째~N번째: 캐릭터 참조 이미지 (캐릭터 외모) - 캐릭터별로 순차 배치
        // N+1~M번째: 스타일 참조 이미지 (느낌/분위기)
        // M+1~끝: 이전 장면 이미지 (일관성 유지)
        const getConsistencyReferences = (additionalImages: string[] = [], sceneIndex: number = 0) => {
          // 1. 캐릭터 이미지 (외모 참조용 - 캐릭터별로 순차 수집, 모드에 따라 처리)
          const charImagesWithMapping: { url: string; charName: string; mode: string }[] = [];
          const characterMapping: { name: string; startIdx: number; endIdx: number; mode: string }[] = [];
          let currentIdx = 1;

          console.log(`[getConsistencyReferences] 장면 ${sceneIndex + 1}, 캐릭터 수: ${selectedCharacters.length}`);

          selectedCharacters.forEach((char) => {
            const mode = characterImageModes[char.id] || "ai_reference";
            console.log(`[getConsistencyReferences] 캐릭터: ${char.name}, 모드: ${mode}, 업로드이미지: ${(char.referenceImages || []).length}개, 생성이미지: ${(char.generatedImages || []).length}개`);

            // "ai_create" 모드면 해당 캐릭터의 참조 이미지 건너뛰기
            if (mode === "ai_create") {
              characterMapping.push({
                name: char.name,
                startIdx: 0,
                endIdx: 0,
                mode: "새로생성"
              });
              return;
            }

            const startIdx = currentIdx;
            // 업로드 이미지 (최대 2개)
            const rawUploaded = char.referenceImages || [];
            console.log(`[getConsistencyReferences] ${char.name} 원본 업로드이미지:`, rawUploaded);
            const uploaded = rawUploaded
              .map(img => toAbsoluteUrl(img))
              .filter((img): img is string => img !== null)
              .slice(0, 2);
            console.log(`[getConsistencyReferences] ${char.name} 변환된 업로드이미지:`, uploaded);
            uploaded.forEach(url => {
              charImagesWithMapping.push({ url, charName: char.name, mode });
            });

            // 생성 이미지 (최대 1개)
            const rawGenerated = char.generatedImages || [];
            console.log(`[getConsistencyReferences] ${char.name} 원본 생성이미지:`, rawGenerated);
            const generated = rawGenerated
              .filter(img => img && (img.includes('replicate.delivery') || img.includes('replicate.com')))
              .slice(0, 1);
            console.log(`[getConsistencyReferences] ${char.name} 필터된 생성이미지:`, generated);
            generated.forEach(url => {
              charImagesWithMapping.push({ url, charName: char.name, mode });
            });

            const totalForChar = uploaded.length + generated.length;
            if (totalForChar > 0) {
              currentIdx += totalForChar;
              characterMapping.push({
                name: char.name,
                startIdx,
                endIdx: currentIdx - 1,
                mode: mode === "attached" ? "첨부사용" : "AI참조"
              });
            }
          });

          const charImages = charImagesWithMapping.map(c => c.url).slice(0, 6); // 총 최대 6개

          // 2. 스타일 참조 이미지 (느낌/분위기 참조용)
          const styleImages = styleRefImages.slice(0, 3);

          // 3. 이전 생성된 이미지 (일관성 유지용)
          const previousGenerated = previousGeneratedImages.slice(-4);

          // 4. 현재 장면의 추가 이미지 (시작 프레임 - 끝 프레임 생성 시)
          const additional = additionalImages.slice(0, 2);

          // 순서대로 구성: 캐릭터 → 스타일 → 이전 장면 → 추가
          const refs: string[] = [
            ...charImages,
            ...styleImages,
            ...previousGenerated,
            ...additional,
          ];

          const charMappingLog = characterMapping.map(m =>
            m.startIdx === 0 ? `${m.name}(${m.mode})` :
            m.startIdx === m.endIdx ? `${m.name}(${m.mode}): Image ${m.startIdx}` : `${m.name}(${m.mode}): Image ${m.startIdx}-${m.endIdx}`
          ).join(', ');

          console.log(`[참조이미지 구성] 장면 ${sceneIndex + 1}:
  - Image 1~${charImages.length}: 캐릭터 이미지 ${charImages.length}개 (${charMappingLog || '없음'})
  - Image ${charImages.length + 1}~${charImages.length + styleImages.length}: 스타일 참조 ${styleImages.length}개
  - Image ${charImages.length + styleImages.length + 1}~${charImages.length + styleImages.length + previousGenerated.length}: 이전 장면 ${previousGenerated.length}개
  - Image ${charImages.length + styleImages.length + previousGenerated.length + 1}~끝: 추가 이미지 ${additional.length}개`);

          // 중복 제거 및 유효한 URL만 필터
          const uniqueRefs = [...new Set(refs)].filter(
            img => img && (img.startsWith('http://') || img.startsWith('https://'))
          );

          const result = uniqueRefs.slice(0, 14);
          console.log(`[참조이미지] 최종 결과: ${result.length}개`, result.map(url => url.substring(0, 60)));

          return {
            images: result,
            charCount: charImages.length,
            styleCount: styleImages.length,
            prevCount: previousGenerated.length,
            characterMapping // 캐릭터별 이미지 번호 매핑 정보
          };
        };

        // Nano Banana Pro용 이미지 참조 프롬프트 생성 함수 (캐릭터 이름 포함)
        const buildImageRefPrompt = (refInfo: {
          charCount: number;
          styleCount: number;
          prevCount: number;
          characterMapping?: { name: string; startIdx: number; endIdx: number }[]
        }) => {
          const parts: string[] = [];
          let idx = 1;

          if (refInfo.charCount > 0 && refInfo.characterMapping && refInfo.characterMapping.length > 0) {
            // 캐릭터별로 이미지 번호와 이름을 명시
            const charParts = refInfo.characterMapping.map(m => {
              const range = m.startIdx === m.endIdx ? `Image ${m.startIdx}` : `Image ${m.startIdx}-${m.endIdx}`;
              return `${range}=${m.name}`;
            });
            parts.push(`Character references: ${charParts.join(', ')} - preserve exact facial features and appearance for each character`);
            idx = refInfo.charCount + 1;
          } else if (refInfo.charCount > 0) {
            const charEnd = idx + refInfo.charCount - 1;
            parts.push(`Using Image ${idx}${refInfo.charCount > 1 ? `-${charEnd}` : ''} (character reference - preserve exact facial features and appearance)`);
            idx = charEnd + 1;
          }

          if (refInfo.styleCount > 0) {
            const styleEnd = idx + refInfo.styleCount - 1;
            parts.push(`Image ${idx}${refInfo.styleCount > 1 ? `-${styleEnd}` : ''} (style reference - match visual style, mood, and color tone)`);
            idx = styleEnd + 1;
          }

          // 스타일 참조 텍스트가 있으면 추가
          if (styleReferenceText) {
            parts.push(`Style: ${styleReferenceText}`);
          }

          return parts.length > 0 ? parts.join(', ') + '. ' : '';
        };

        // 1. 시작 프레임 생성 (재시도 로직 포함)
        // 시작 프레임의 참조 이미지 정보를 저장해서 끝 프레임에서도 사용
        const startFrameRefInfo = getConsistencyReferences([], i);

        if (scene.prompt1) {
          const imageRefPrompt = buildImageRefPrompt(startFrameRefInfo);
          const promptWithDialogue = addDialogueToPrompt(scene.prompt1, scene.dialogue1);
          const enhancedPrompt = imageRefPrompt + promptWithDialogue;
          const frameLabel = `장면 ${i + 1} 시작 프레임`;

          console.log(`${frameLabel}: 참조 이미지 ${startFrameRefInfo.images.length}개 사용`);
          console.log(`${frameLabel} 프롬프트 (참조 정보 포함):`, enhancedPrompt.substring(0, 200) + '...');
          setLoadingStep(`${frameLabel} 생성 중...`);

          const result1 = await generateImageWithRetry({
            apiKey,
            model: imageModel,
            prompt: enhancedPrompt,
            aspectRatio,
            referenceImages: startFrameRefInfo.images.length > 0 ? startFrameRefInfo.images : undefined,
          }, 5, frameLabel);

          if (result1.success && result1.url) {
            sceneImages.push(result1.url);
            sceneSeeds.push(0); // seed 미지원
          } else {
            const errorMsg = `${frameLabel} 생성 실패: ${result1.error || '알 수 없는 오류'}`;
            console.error(errorMsg);
            setError(errorMsg);
            throw new Error(errorMsg);
          }
        }

        // 2. 끝 프레임 생성 (시작 프레임의 참조 이미지 + 시작 프레임 이미지 사용)
        if (scene.prompt2) {
          // 시작 프레임의 참조 이미지에 시작 프레임 결과를 추가 (캐릭터 일관성 유지)
          const endFrameRefs = [...startFrameRefInfo.images, ...sceneImages]
            .filter((v, idx, arr) => arr.indexOf(v) === idx) // 중복 제거
            .slice(0, 14);

          const endFrameRefInfo = {
            images: endFrameRefs,
            charCount: startFrameRefInfo.charCount,
            styleCount: startFrameRefInfo.styleCount,
            prevCount: startFrameRefInfo.prevCount,
            characterMapping: startFrameRefInfo.characterMapping
          };

          const imageRefPrompt = buildImageRefPrompt(endFrameRefInfo);
          const promptWithDialogue = addDialogueToPrompt(scene.prompt2, scene.dialogue2);
          const enhancedPrompt = imageRefPrompt + promptWithDialogue;
          const frameLabel = `장면 ${i + 1} 끝 프레임`;

          console.log(`${frameLabel}: 참조 이미지 ${endFrameRefs.length}개 사용 (시작 프레임 ${startFrameRefInfo.images.length}개 + 생성 ${sceneImages.length}개)`);
          console.log(`${frameLabel} 프롬프트 (참조 정보 포함):`, enhancedPrompt.substring(0, 200) + '...');
          setLoadingStep(`${frameLabel} 생성 중...`);

          const result2 = await generateImageWithRetry({
            apiKey,
            model: imageModel,
            prompt: enhancedPrompt,
            aspectRatio,
            referenceImages: endFrameRefs.length > 0 ? endFrameRefs : undefined
          }, 5, frameLabel);

          if (result2.success && result2.url) {
            sceneImages.push(result2.url);
            sceneSeeds.push(0); // seed 미지원
          } else {
            const errorMsg = `${frameLabel} 생성 실패: ${result2.error || '알 수 없는 오류'}`;
            console.error(errorMsg);
            setError(errorMsg);
            throw new Error(errorMsg);
          }
        }

        // 히스토리용 배열에 추가
        allImages.push({ id: i, images: sceneImages, seeds: sceneSeeds });

        // 실시간으로 화면에 표시 (각 장면이 완료될 때마다)
        setGeneratedImages(prev => [...prev, { id: i, images: sceneImages, seeds: sceneSeeds }]);

        // 다음 장면의 참조용으로 현재 장면 이미지 저장 (캐릭터 일관성 유지)
        previousGeneratedImages.push(...sceneImages);
      }

      // 시드와 프롬프트를 히스토리에 저장
      const seedsArray = allImages.map((img) => img.seeds);
      saveImageSeedsToHistory(seedsArray, imagePrompts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이미지 생성 실패";
      console.error("Image generation error:", errorMessage);
      setError(errorMessage);
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
      // format에 따른 aspectRatio 결정
      const formatConfig = VIDEO_FORMATS.find(f => f.id === styleOptions.format);
      const aspectRatio = formatConfig?.aspectRatio || "16:9";

      // 상대 경로를 공개 URL로 변환하는 함수 (Replicate에서 접근 가능하도록)
      const toAbsoluteUrl = (url: unknown): string | null => {
        if (!url || typeof url !== 'string') return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const PUBLIC_DOMAIN = "https://mov.hwasubun.ai";
        if (url.startsWith('/')) {
          let publicPath = url;
          if (url.includes('/uploads/') && !url.includes('/api/uploads/')) {
            publicPath = url.replace('/uploads/', '/api/uploads/');
          }
          return `${PUBLIC_DOMAIN}${publicPath}`;
        }
        return null;
      };

      // 캐릭터 참조 이미지 배열 준비 (selectedCharacters에서 추출, 절대 URL로 변환)
      const characterRefImages = selectedCharacters
        .flatMap(c => [...(c.referenceImages || []), ...(c.generatedImages || [])])
        .map(img => toAbsoluteUrl(img))
        .filter((img): img is string => img !== null);

      // 이전 장면의 이미지도 참조로 추가 (캐릭터 일관성)
      const previousImages = generatedImages
        .slice(0, sceneIndex)
        .flatMap(s => s.images)
        .map(img => toAbsoluteUrl(img))
        .filter((img): img is string => img !== null);

      const referenceImages = [...characterRefImages.slice(0, 6), ...previousImages.slice(-6)]
        .filter((v, i, a) => a.indexOf(v) === i) // 중복 제거
        .slice(0, 14);

      console.log(`재생성 시 참조 이미지 ${referenceImages.length}개 사용`, referenceImages);

      // 재시도 로직이 포함된 헬퍼 함수 사용
      const frameLabel = `장면 ${sceneIndex + 1} ${imageIndex === 0 ? '시작' : '끝'} 프레임 재생성`;
      const result = await generateImageWithRetry(
        {
          apiKey,
          model: imageModel,
          prompt,
          aspectRatio,
          referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
        },
        3,
        frameLabel
      );

      if (result.success && result.url) {
        const newImages = [...generatedImages];
        newImages[sceneIndex].images[imageIndex] = result.url;
        setGeneratedImages(newImages);
      } else {
        const errorMsg = `이미지 재생성 실패: ${result.error || '알 수 없는 오류'}`;
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이미지 재생성 실패";
      console.error("Image regeneration error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 모든 장면에 이미지가 있는지 확인
  const allScenesHaveImages = imagePrompts.length > 0 &&
    imagePrompts.every((_, idx) =>
      generatedImages[idx]?.images?.length > 0
    );

  // 이미지가 없는 장면 목록
  const scenesWithoutImages = imagePrompts
    .map((_, idx) => idx)
    .filter(idx => !generatedImages[idx]?.images?.length);

  // 단일 장면 이미지 생성 (재생성 포함)
  const generateSingleSceneImages = async (sceneIndex: number) => {
    if (!apiKey) return;

    const scene = imagePrompts[sceneIndex];
    if (!scene) return;

    setLoading(true);
    setLoadingStep(`장면 ${sceneIndex + 1} 이미지 생성 중...`);
    setError(null);

    try {
      const formatConfig = VIDEO_FORMATS.find(f => f.id === styleOptions.format);
      const aspectRatio = formatConfig?.aspectRatio || "16:9";

      // 상대 경로를 공개 URL로 변환하는 함수 (Replicate에서 접근 가능하도록)
      const toAbsoluteUrl = (url: unknown): string | null => {
        if (!url || typeof url !== 'string') return null;
        // 이미 절대 URL이면 그대로 반환
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // 프로덕션 공개 도메인 사용 (Replicate가 접근할 수 있어야 함)
        const PUBLIC_DOMAIN = "https://mov.hwasubun.ai";
        // 상대 경로인 경우 공개 URL로 변환
        if (url.startsWith('/')) {
          let publicPath = url;
          // /uploads/ -> /api/uploads/ (API 라우트를 통해 외부에서 접근 가능)
          if (url.includes('/uploads/') && !url.includes('/api/uploads/')) {
            publicPath = url.replace('/uploads/', '/api/uploads/');
          }
          return `${PUBLIC_DOMAIN}${publicPath}`;
        }
        return null;
      };

      // 캐릭터 참조 이미지
      const characterRefImages = selectedCharacters
        .flatMap(c => [...(c.referenceImages || []), ...(c.generatedImages || [])])
        .map(img => toAbsoluteUrl(img))
        .filter((img): img is string => img !== null);

      // 이전 장면의 이미지도 참조로 추가
      const previousImages = generatedImages
        .slice(0, sceneIndex)
        .flatMap(s => s.images)
        .map(img => toAbsoluteUrl(img))
        .filter((img): img is string => img !== null);

      const referenceImages = [...characterRefImages.slice(0, 6), ...previousImages.slice(-6)]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 14);

      const sceneImages: string[] = [];
      const prompts = [scene.prompt1, scene.prompt2];

      for (let frameIdx = 0; frameIdx < prompts.length; frameIdx++) {
        const prompt = prompts[frameIdx];
        if (!prompt) continue;

        setLoadingStep(`장면 ${sceneIndex + 1} ${frameIdx === 0 ? '시작' : '끝'} 프레임 생성 중...`);

        const result = await generateImageWithRetry(
          {
            apiKey,
            model: imageModel,
            prompt,
            aspectRatio,
            referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
          },
          5,
          `장면 ${sceneIndex + 1} ${frameIdx === 0 ? '시작' : '끝'} 프레임`
        );

        if (result.success && result.url) {
          sceneImages.push(result.url);
        } else {
          setError(`장면 ${sceneIndex + 1} 프레임 ${frameIdx + 1} 생성 실패: ${result.error}`);
          return;
        }
      }

      // 이미지 업데이트
      const newGeneratedImages = [...generatedImages];
      while (newGeneratedImages.length <= sceneIndex) {
        newGeneratedImages.push({ id: newGeneratedImages.length, images: [], seeds: [] });
      }
      newGeneratedImages[sceneIndex] = {
        id: scene.id,
        images: sceneImages,
        seeds: [], // 단일 장면 생성에서는 seeds 미사용
      };
      setGeneratedImages(newGeneratedImages);
      setImagesDownloaded(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이미지 생성 실패";
      console.error("Single scene image generation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 단일 장면 영상 생성 (재생성 포함)
  const generateSingleSceneVideo = async (sceneIndex: number) => {
    if (!apiKey) return;

    const sceneImages = generatedImages[sceneIndex]?.images;
    if (!sceneImages || sceneImages.length === 0) {
      setError(`장면 ${sceneIndex + 1}에 이미지가 없습니다. 먼저 이미지를 생성해주세요.`);
      return;
    }

    setLoading(true);
    setLoadingStep(`장면 ${sceneIndex + 1} 영상 생성 중...`);
    setError(null);

    try {
      const sceneVideoPrompt = imagePrompts[sceneIndex]?.videoPrompt || `장면 ${sceneIndex + 1} 영상`;

      const res = await fetch("/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: videoModel,
          prompt: sceneVideoPrompt,
          referenceImages: sceneImages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newVideoUrls = [...videoUrls];
        while (newVideoUrls.length <= sceneIndex) {
          newVideoUrls.push("");
        }
        newVideoUrls[sceneIndex] = data.url;
        setVideoUrls(newVideoUrls);
        setVideoDownloaded(false);
      } else {
        const errorMsg = `장면 ${sceneIndex + 1} 영상 생성 실패: ${data.error || '알 수 없는 오류'}`;
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "영상 생성 실패";
      console.error("Single scene video generation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 단일 장면 스크립트 재생성
  const regenerateSingleSceneScript = async (sceneIndex: number) => {
    if (!apiKey || !topic) return;

    setLoading(true);
    setLoadingStep(`장면 ${sceneIndex + 1} 스크립트 재생성 중...`);
    setError(null);

    try {
      const characterGuide = generateCharacterPrompt();
      const detailedStyleGuide = generateDetailedStyleGuide();
      const currentScene = imagePrompts[sceneIndex];
      const sceneSettings: SceneSettings = currentScene?.settings || { ...defaultSceneSettings };
      const imageStyleGuide = generateImageStylePrompt(sceneSettings);
      const videoStyleGuide = generateVideoStylePrompt(sceneSettings);

      const sceneRes = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: textModel,
          prompt: `당신은 세계적인 영화감독이자 시네마토그래퍼입니다. AI 영상 생성 모델을 위한 최고 품질의 상세 프롬프트를 작성합니다.

**★★★ 최우선 지침 ★★★**
1. 모든 응답은 반드시 한글로 작성하세요. 단, 숫자는 아라비아 숫자(1, 2, 3...)로 표기하세요. 영어 단어 사용 금지.
2. 각 프롬프트는 매우 길고 상세하게 작성하세요 (최소 150단어 이상).
3. 모든 시각적 요소를 구체적인 수치와 방향으로 명시하세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 【 영상 기획 정보 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 주제: ${topic}
${topicBackground ? `• 배경 설정: ${topicBackground}` : ""}
${topicMood ? `• 원하는 분위기: ${topicMood}` : ""}
${topicScenes ? `• 주요 장면 구상: ${topicScenes}` : ""}
${topicStoryline ? `• 스토리 줄거리: ${topicStoryline}` : ""}
${topicSpecial ? `• 특별 요청사항: ${topicSpecial}` : ""}

${characterGuide ? `${characterGuide}\n` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         【 재생성 대상: 장면 ${sceneIndex + 1} / 총 ${imagePrompts.length}장면 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${sceneIndex === 0 ? "▶ 오프닝 장면: 시청자의 관심을 사로잡는 강렬한 첫인상" :
  sceneIndex === imagePrompts.length - 1 ? "▶ 엔딩 장면: 여운과 감동을 남기는 마무리" :
  sceneIndex === Math.floor(imagePrompts.length / 2) ? "▶ 클라이맥스 장면: 감정의 정점, 가장 인상적인 순간" :
  `▶ 전개 장면: 스토리를 이어가는 중요한 연결고리`}

${detailedStyleGuide}

${imageStyleGuide}

${videoStyleGuide}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    【 응답 형식 】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FRAME1: [시작 프레임 - 정적 이미지 묘사 - 최소 100단어]

FRAME2: [끝 프레임 - 정적 이미지 묘사 - 최소 100단어]

VIDEO: [이 장면의 상세한 모션/카메라/환경 변화 묘사 - 최소 200단어]`,
        }),
      });

      const sceneData = await sceneRes.json();
      if (sceneData.success) {
        const text = sceneData.text;
        const frame1Match = text.match(/FRAME1:\s*(.+?)(?=FRAME2:|VIDEO:|$)/s);
        const frame2Match = text.match(/FRAME2:\s*(.+?)(?=VIDEO:|$)/s);
        const videoMatch = text.match(/VIDEO:\s*(.+?)$/s);

        const newPrompt: ImagePrompt = {
          id: sceneIndex,
          prompt1: frame1Match ? frame1Match[1].trim() : "",
          prompt2: frame2Match ? frame2Match[1].trim() : "",
          prompt3: "",
          videoPrompt: videoMatch ? videoMatch[1].trim() : "",
          settings: sceneSettings,
        };

        // 해당 장면만 업데이트
        setImagePrompts(prev => {
          const updated = [...prev];
          updated[sceneIndex] = newPrompt;
          return updated;
        });
      } else {
        setError(`장면 ${sceneIndex + 1} 스크립트 재생성 실패: ${sceneData.error || '알 수 없는 오류'}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "스크립트 재생성 실패";
      console.error("Single scene script regeneration error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // 장면별 영상 생성
  const generateVideo = async () => {
    if (!apiKey || generatedImages.length === 0) return;

    // 모든 장면에 이미지가 있는지 확인
    if (!allScenesHaveImages) {
      setError(`이미지가 없는 장면이 있습니다: ${scenesWithoutImages.map(i => `장면 ${i + 1}`).join(", ")}. 먼저 모든 장면의 이미지를 생성해주세요.`);
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrls([]); // 기존 영상 초기화

    const newVideoUrls: string[] = [];

    try {
      // 각 장면별로 영상 생성
      for (let i = 0; i < generatedImages.length; i++) {
        setLoadingStep(`장면 ${i + 1}/${generatedImages.length} 영상 생성 중...`);

        const sceneImages = generatedImages[i].images;
        // 해당 장면의 비디오 프롬프트 사용 (없으면 전역 프롬프트 사용)
        const sceneVideoPrompt = imagePrompts[i]?.videoPrompt || `장면 ${i + 1} 영상`;

        const res = await fetch("/api/generate/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            model: videoModel,
            prompt: sceneVideoPrompt,
            referenceImages: sceneImages,
          }),
        });

        const data = await res.json();
        if (data.success) {
          newVideoUrls.push(data.url);
          setVideoUrls([...newVideoUrls]); // 실시간으로 UI 업데이트
        } else {
          const errorMsg = `장면 ${i + 1} 영상 생성 실패: ${data.error || '알 수 없는 오류'}`;
          console.error(errorMsg);
          // 실패해도 계속 진행 (빈 문자열 추가)
          newVideoUrls.push("");
          setVideoUrls([...newVideoUrls]);
        }
      }

      // 최소 1개 이상 성공한 경우
      if (newVideoUrls.some(url => url)) {
        setStep("done");

        // 생성 기록 저장
        await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "workflow",
            prompt: topic,
            model: `${imageModel} + ${videoModel}`,
            resultUrl: newVideoUrls.filter(url => url).join(", "),
            metadata: {
              topic,
              sceneCount,
              styleOptions,
              imagePrompts,
              generatedImages: generatedImages.flatMap(g => g.images),
              videoUrls: newVideoUrls,
            },
          }),
        });
      } else {
        setError("모든 장면 영상 생성에 실패했습니다.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "영상 생성 실패";
      console.error("Video generation error:", errorMessage);
      setError(errorMessage);
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
    setTopicBackground("");
    setTopicMood("");
    setTopicScenes("");
    setTopicSpecial("");
    setImagePrompts([]);
    setGeneratedImages([]);
    setVideoUrls([]);
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

=== 영상 기획 ===
주제: ${topic}
${topicBackground ? `배경: ${topicBackground}` : ""}
${topicMood ? `분위기: ${topicMood}` : ""}

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

  // 배경음악 생성 함수
  const generateMusic = async () => {
    if (!apiKey || !musicPrompt.trim()) {
      setError("음악 프롬프트를 입력해주세요.");
      return;
    }

    setGeneratingMusic(true);
    setError(null);

    try {
      const res = await fetch("/api/generate/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          prompt: musicPrompt,
          duration: musicDuration,
        }),
      });

      const data = await res.json();
      if (data.success && data.url) {
        setMusicUrl(data.url);
      } else {
        setError(data.error || "음악 생성에 실패했습니다.");
      }
    } catch {
      setError("음악 생성 중 오류가 발생했습니다.");
    } finally {
      setGeneratingMusic(false);
    }
  };

  // 배경음악 프롬프트 자동 생성
  const generateMusicPromptFromTopic = async () => {
    if (!apiKey || !topic) return;

    try {
      const res = await fetch("/api/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model: textModel,
          prompt: `당신은 음악 프로듀서입니다. 다음 영상 컨셉에 어울리는 배경음악을 설명하는 프롬프트를 영어로 작성하세요.

영상 주제: ${topic}
${topicMood ? `분위기: ${topicMood}` : ""}
장르: ${styleOptions.genre}
${topicStoryline ? `줄거리: ${topicStoryline}` : ""}

음악 프롬프트를 50단어 이내로 작성하세요. 템포, 악기, 분위기를 포함하세요.
프롬프트만 작성하고 다른 설명은 하지 마세요.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMusicPrompt(data.text.trim());
      }
    } catch {
      console.error("Failed to generate music prompt");
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
    { id: "audio", name: "오디오", icon: "🔊" },
  ];
  // 촬영/편집 탭은 장면별로 설정하므로 전체 영상 레벨에서 제거

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">워크플로우</h1>
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
            {/* 선택 모드: 새 주제 vs 불러오기 */}
            {topicMode === "select" && (
              <div className="space-y-6">
                {/* 이미 생성된 스크립트가 있으면 복구 옵션 표시 */}
                {imagePrompts.length > 0 && (
                  <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📜</div>
                      <div>
                        <p className="text-blue-200 font-medium">진행 중인 스크립트가 있습니다</p>
                        <p className="text-blue-300/70 text-sm">{imagePrompts.length}개 장면 - &quot;{topic}&quot;</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("script")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      스크립트로 돌아가기
                    </button>
                  </div>
                )}

                {/* 이미 생성된 이미지가 있으면 복구 옵션 표시 */}
                {generatedImages.length > 0 && (
                  <div className="bg-purple-900/30 border border-purple-600 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🖼️</div>
                      <div>
                        <p className="text-purple-200 font-medium">생성된 이미지가 있습니다</p>
                        <p className="text-purple-300/70 text-sm">{generatedImages.length}개 장면, {generatedImages.flatMap(g => g.images).length}장 이미지</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep("image")}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium flex items-center gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      이미지로 돌아가기
                    </button>
                  </div>
                )}

                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-white mb-2">영상 주제 선택</h2>
                  <p className="text-zinc-400">새 영상을 만들거나 이전 작업을 불러오세요</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 새 주제 시작 */}
                  <button
                    onClick={startNewTopic}
                    className="p-6 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500/50 rounded-xl hover:border-purple-400 transition-colors group"
                  >
                    <div className="text-4xl mb-3">✨</div>
                    <h3 className="text-lg font-semibold text-white mb-2">새 주제 입력</h3>
                    <p className="text-sm text-zinc-400">새로운 영상 주제를 입력하고 스타일을 설정합니다</p>
                  </button>

                  {/* 기존 주제 불러오기 (히스토리 목록) */}
                  <div className="p-6 bg-zinc-800/50 border-2 border-zinc-700 rounded-xl">
                    <div className="text-4xl mb-3">📂</div>
                    <h3 className="text-lg font-semibold text-white mb-2">기존 주제 불러오기</h3>
                    <p className="text-sm text-zinc-400 mb-4">저장된 {topicHistory.length}개의 주제가 있습니다</p>

                    {topicHistory.length === 0 ? (
                      <p className="text-center text-zinc-500 text-sm py-4">저장된 주제가 없습니다</p>
                    ) : (
                      <>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {sortedTopicHistory
                            .slice(topicHistoryPage * ITEMS_PER_PAGE, (topicHistoryPage + 1) * ITEMS_PER_PAGE)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="w-full p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg text-left transition-colors flex items-center justify-between group"
                              >
                                <button
                                  onClick={() => loadTopicFromHistory(item)}
                                  className="flex-1 min-w-0 text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    {item.favorite && <span className="text-yellow-400">⭐</span>}
                                    <span className="text-white font-medium truncate">{item.topic}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                    {item.styleOptions && (
                                      <>
                                        <span className="bg-zinc-600/50 px-1.5 py-0.5 rounded">
                                          {VIDEO_FORMATS.find(f => f.id === item.styleOptions?.format)?.name || item.styleOptions.format}
                                        </span>
                                        <span className="bg-zinc-600/50 px-1.5 py-0.5 rounded">
                                          {VIDEO_GENRES.find(g => g.id === item.styleOptions?.genre)?.name || item.styleOptions.genre}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </button>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={(e) => toggleTopicFavorite(item.id, e)}
                                    className="p-1.5 hover:bg-zinc-600 rounded transition-colors"
                                    title={item.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
                                  >
                                    <Bookmark className={`w-4 h-4 ${item.favorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-500"}`} />
                                  </button>
                                  <button
                                    onClick={(e) => deleteTopicFromHistory(item.id, e)}
                                    className="p-1.5 hover:bg-red-600/50 rounded transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        {/* 페이지네이션 */}
                        {sortedTopicHistory.length > ITEMS_PER_PAGE && (
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700">
                            <button
                              onClick={() => setTopicHistoryPage(p => Math.max(0, p - 1))}
                              disabled={topicHistoryPage === 0}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              이전
                            </button>
                            <span className="text-xs text-zinc-500">
                              {topicHistoryPage + 1} / {Math.ceil(sortedTopicHistory.length / ITEMS_PER_PAGE)}
                            </span>
                            <button
                              onClick={() => setTopicHistoryPage(p => Math.min(Math.ceil(sortedTopicHistory.length / ITEMS_PER_PAGE) - 1, p + 1))}
                              disabled={topicHistoryPage >= Math.ceil(sortedTopicHistory.length / ITEMS_PER_PAGE) - 1}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              다음
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 편집 모드 */}
            {topicMode === "edit" && (
              <>
                {/* 뒤로가기 버튼 */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={backToTopicSelect}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>주제 선택으로 돌아가기</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {currentTopicId ? "기존 주제 수정 중" : "새 주제 작성 중"}
                    </span>
                    <button
                      onClick={saveCurrentTopic}
                      disabled={!topic.trim()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      저장
                    </button>
                  </div>
                </div>

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
                                  <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditPresetModal(preset);
                                      }}
                                      className="p-1.5 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-colors"
                                      title="수정"
                                    >
                                      <Edit2 className="w-3 h-3 text-white" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteUserPreset(preset.id);
                                      }}
                                      className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg transition-colors"
                                      title="삭제"
                                    >
                                      <Trash2 className="w-3 h-3 text-white" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 기본 프리셋 */}
                        <div>
                          <label className="block text-sm text-zinc-400 mb-3">
                            <Sparkles className="w-4 h-4 inline mr-1" />
                            기본 프리셋 - 클릭하여 적용, + 버튼으로 내 프리셋에 저장 ({STYLE_PRESETS.length}개)
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
                            {STYLE_PRESETS.map((preset) => (
                              <div
                                key={preset.id}
                                className="relative p-4 rounded-xl text-left transition-all bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 hover:border-purple-500 hover:from-purple-900/20 hover:to-zinc-900"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    applyPreset(preset.id);
                                  }}
                                  className="w-full text-left"
                                >
                                  <span className="text-2xl mb-2 block">{preset.icon}</span>
                                  <p className="font-semibold text-white text-sm">{preset.name}</p>
                                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{preset.description}</p>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyPreset(preset.id);
                                    setPresetName(preset.name + " (수정)");
                                    setPresetDescription(preset.description || "");
                                    setPresetIcon(preset.icon);
                                    setShowSavePresetModal(true);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-colors"
                                  title="내 프리셋으로 저장"
                                >
                                  <Plus className="w-3 h-3 text-white" />
                                </button>
                              </div>
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
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-zinc-400">장르</label>
                              <button
                                onClick={() => openAddStyleOptionModal("genre")}
                                className="p-1 bg-purple-600/20 hover:bg-purple-600/40 rounded text-purple-400 transition-colors"
                                title="커스텀 장르 추가"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
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
                              {/* 커스텀 장르 옵션 (수정/삭제 가능) */}
                              {getCustomOptionsForType("genre").map((opt) => (
                                <div key={opt.id} className="relative group">
                                  <StyleButton
                                    item={{ id: opt.optionId, name: opt.name, description: opt.description || "", icon: opt.icon || "🎬" }}
                                    selected={styleOptions.genre === opt.optionId}
                                    onClick={() => setStyleOptions({ ...styleOptions, genre: opt.optionId })}
                                  />
                                  <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEditStyleOptionModal(opt); }}
                                      className="p-0.5 bg-blue-600/80 hover:bg-blue-600 rounded text-white"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteStyleOption(opt.id); }}
                                      className="p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {/* 기본 장르 옵션 */}
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
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-zinc-400">분위기</label>
                              <button
                                onClick={() => openAddStyleOptionModal("mood")}
                                className="p-1 bg-blue-600/20 hover:bg-blue-600/40 rounded text-blue-400 transition-colors"
                                title="커스텀 분위기 추가"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
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
                              {/* 커스텀 분위기 옵션 */}
                              {getCustomOptionsForType("mood").map((opt) => (
                                <div key={opt.id} className="relative group">
                                  <StyleButton
                                    item={{ id: opt.optionId, name: opt.name, description: opt.description || "", icon: opt.icon || "🎬" }}
                                    selected={styleOptions.mood === opt.optionId}
                                    onClick={() => setStyleOptions({ ...styleOptions, mood: opt.optionId })}
                                  />
                                  <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEditStyleOptionModal(opt); }}
                                      className="p-0.5 bg-blue-600/80 hover:bg-blue-600 rounded text-white"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteStyleOption(opt.id); }}
                                      className="p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
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
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm text-zinc-400">비주얼 스타일</label>
                            <button
                              onClick={() => openAddStyleOptionModal("visualStyle")}
                              className="p-1 bg-purple-600/20 hover:bg-purple-600/40 rounded text-purple-400 transition-colors"
                              title="커스텀 비주얼 스타일 추가"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            {/* 커스텀 비주얼 스타일 */}
                            {getCustomOptionsForType("visualStyle").map((opt) => (
                              <div key={opt.id} className="relative group">
                                <StyleButton
                                  item={{ id: opt.optionId, name: opt.name, description: opt.description || "", icon: opt.icon || "🎬" }}
                                  selected={styleOptions.visualStyle === opt.optionId}
                                  onClick={() => setStyleOptions({ ...styleOptions, visualStyle: opt.optionId })}
                                />
                                <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openEditStyleOptionModal(opt); }}
                                    className="p-0.5 bg-blue-600/80 hover:bg-blue-600 rounded text-white"
                                  >
                                    <Edit2 className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteStyleOption(opt.id); }}
                                    className="p-0.5 bg-red-600/80 hover:bg-red-600 rounded text-white"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
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

                        {/* 스타일 참조 이미지 섹션 */}
                        <div className="border-t border-zinc-700 pt-4 mt-4">
                          <label className="block text-sm text-zinc-400 mb-2">
                            <span className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              스타일 참조 이미지 (느낌 이미지)
                            </span>
                          </label>
                          <p className="text-xs text-zinc-500 mb-3">
                            원하는 느낌의 이미지를 업로드하면, 생성되는 이미지가 해당 스타일을 참조합니다.
                          </p>

                          <div className="space-y-3">
                            {/* 업로드된 이미지 미리보기 */}
                            {styleReferenceImages.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {styleReferenceImages.map((img, idx) => (
                                  <div key={idx} className="relative group">
                                    <img
                                      src={img}
                                      alt={`스타일 참조 ${idx + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-zinc-600"
                                    />
                                    <button
                                      onClick={() => setStyleReferenceImages(styleReferenceImages.filter((_, i) => i !== idx))}
                                      className="absolute -top-1 -right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* 업로드 버튼 */}
                            <div className="flex gap-2">
                              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                isUploadingStyleRef
                                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                  : "bg-purple-600/20 hover:bg-purple-600/40 text-purple-400"
                              }`}>
                                {isUploadingStyleRef ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Upload className="w-4 h-4" />
                                )}
                                <span className="text-sm">
                                  {isUploadingStyleRef ? "업로드 중..." : "이미지 업로드"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  disabled={isUploadingStyleRef}
                                  onChange={async (e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;

                                    setIsUploadingStyleRef(true);
                                    try {
                                      const newImages: string[] = [];
                                      for (const file of Array.from(files)) {
                                        const formData = new FormData();
                                        formData.append("file", file);

                                        const res = await fetch("/api/upload", {
                                          method: "POST",
                                          body: formData,
                                        });

                                        if (res.ok) {
                                          const data = await res.json();
                                          newImages.push(data.url);
                                        }
                                      }
                                      setStyleReferenceImages([...styleReferenceImages, ...newImages].slice(0, 5));
                                    } catch (error) {
                                      console.error("스타일 참조 이미지 업로드 실패:", error);
                                    } finally {
                                      setIsUploadingStyleRef(false);
                                      e.target.value = "";
                                    }
                                  }}
                                />
                              </label>
                              {styleReferenceImages.length > 0 && (
                                <button
                                  onClick={() => setStyleReferenceImages([])}
                                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-colors"
                                >
                                  전체 삭제
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600">최대 5개까지 업로드 가능</p>
                          </div>
                        </div>

                        {/* 스타일 설명 텍스트 */}
                        <div className="border-t border-zinc-700 pt-4 mt-4">
                          <label className="block text-sm text-zinc-400 mb-2">
                            스타일 설명 (텍스트)
                          </label>
                          <p className="text-xs text-zinc-500 mb-2">
                            원하는 스타일을 텍스트로 직접 설명할 수 있습니다. (예: &quot;지브리 애니메이션 느낌&quot;, &quot;영화 매트릭스 같은 녹색 톤&quot;)
                          </p>
                          <textarea
                            value={styleReferenceText}
                            onChange={(e) => setStyleReferenceText(e.target.value)}
                            placeholder="예: 지브리 스튜디오 애니메이션 스타일, 따뜻한 색감, 부드러운 질감..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-purple-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}

                    {/* 환경 탭 */}
                    {activeStyleTab === "environment" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-zinc-400">시간대</label>
                              <button
                                onClick={() => openAddStyleOptionModal("timeSetting")}
                                className="p-1 bg-purple-600/20 hover:bg-purple-600/40 rounded text-purple-400 transition-colors"
                                title="커스텀 시간대 추가"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {/* Custom time settings */}
                            {getCustomOptionsForType("timeSetting").map((option) => (
                              <div key={option.id} className="relative group">
                                <StyleButton
                                  item={{ id: option.optionId, name: option.name, icon: option.icon || "🎬", description: option.description || "" }}
                                  selected={styleOptions.timeSetting === option.optionId}
                                  onClick={() => setStyleOptions({ ...styleOptions, timeSetting: option.optionId })}
                                />
                                <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                                  <button onClick={() => openEditStyleOptionModal(option)} className="p-0.5 bg-blue-600 rounded text-white text-xs"><Edit2 className="w-2.5 h-2.5" /></button>
                                  <button onClick={() => deleteStyleOption(option.id)} className="p-0.5 bg-red-600 rounded text-white text-xs"><Trash2 className="w-2.5 h-2.5" /></button>
                                </div>
                              </div>
                            ))}
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

                    {/* 오디오 탭 */}
                    {activeStyleTab === "audio" && (
                      <div className="space-y-6">
                        {/* 배경음악 */}
                        <div className="p-4 bg-zinc-800/50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-white">
                              <Music className="w-4 h-4 text-purple-400" />
                              배경음악
                            </label>
                            <button
                              onClick={() => setAudioOptions({ ...audioOptions, enableMusic: !audioOptions.enableMusic })}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                audioOptions.enableMusic ? "bg-purple-600" : "bg-zinc-600"
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                audioOptions.enableMusic ? "translate-x-6" : "translate-x-0.5"
                              }`} />
                            </button>
                          </div>

                          {audioOptions.enableMusic && (
                            <div className="space-y-3 pl-6">
                              <div>
                                <label className="block text-xs text-zinc-400 mb-2">음악 스타일</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { id: "cinematic", name: "시네마틱", icon: "🎬" },
                                    { id: "electronic", name: "일렉트로닉", icon: "🎹" },
                                    { id: "acoustic", name: "어쿠스틱", icon: "🎸" },
                                    { id: "orchestral", name: "오케스트라", icon: "🎻" },
                                    { id: "ambient", name: "앰비언트", icon: "🌌" },
                                    { id: "pop", name: "팝", icon: "🎤" },
                                    { id: "jazz", name: "재즈", icon: "🎷" },
                                    { id: "custom", name: "직접입력", icon: "✏️" },
                                  ].map((style) => (
                                    <button
                                      key={style.id}
                                      onClick={() => setAudioOptions({ ...audioOptions, musicStyle: style.id })}
                                      className={`p-2 rounded-lg text-xs transition-colors ${
                                        audioOptions.musicStyle === style.id
                                          ? "bg-purple-600 text-white"
                                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                      }`}
                                    >
                                      <span className="mr-1">{style.icon}</span>
                                      {style.name}
                                    </button>
                                  ))}
                                </div>
                                {audioOptions.musicStyle === "custom" && (
                                  <input
                                    type="text"
                                    value={audioOptions.customMusicStyle}
                                    onChange={(e) => setAudioOptions({ ...audioOptions, customMusicStyle: e.target.value })}
                                    placeholder="원하는 음악 스타일을 입력하세요"
                                    className="w-full mt-2 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-white"
                                  />
                                )}
                              </div>
                              <div>
                                <label className="block text-xs text-zinc-400 mb-2">음악 분위기</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    { id: "epic", name: "웅장", icon: "⚔️" },
                                    { id: "calm", name: "차분", icon: "🧘" },
                                    { id: "tense", name: "긴장", icon: "😰" },
                                    { id: "happy", name: "밝음", icon: "😊" },
                                    { id: "sad", name: "슬픔", icon: "😢" },
                                    { id: "mysterious", name: "신비", icon: "🔮" },
                                    { id: "romantic", name: "로맨틱", icon: "💕" },
                                    { id: "energetic", name: "에너지", icon: "⚡" },
                                  ].map((mood) => (
                                    <button
                                      key={mood.id}
                                      onClick={() => setAudioOptions({ ...audioOptions, musicMood: mood.id })}
                                      className={`p-2 rounded-lg text-xs transition-colors ${
                                        audioOptions.musicMood === mood.id
                                          ? "bg-purple-600 text-white"
                                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                      }`}
                                    >
                                      <span className="mr-1">{mood.icon}</span>
                                      {mood.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 효과음 */}
                        <div className="p-4 bg-zinc-800/50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-white">
                              <Waves className="w-4 h-4 text-blue-400" />
                              효과음
                            </label>
                            <button
                              onClick={() => setAudioOptions({ ...audioOptions, enableSoundEffects: !audioOptions.enableSoundEffects })}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                audioOptions.enableSoundEffects ? "bg-blue-600" : "bg-zinc-600"
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                audioOptions.enableSoundEffects ? "translate-x-6" : "translate-x-0.5"
                              }`} />
                            </button>
                          </div>
                        </div>

                        {/* 나레이션 */}
                        <div className="p-4 bg-zinc-800/50 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-white">
                              <Mic className="w-4 h-4 text-green-400" />
                              나레이션
                            </label>
                            <button
                              onClick={() => setAudioOptions({ ...audioOptions, enableNarration: !audioOptions.enableNarration })}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                audioOptions.enableNarration ? "bg-green-600" : "bg-zinc-600"
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                audioOptions.enableNarration ? "translate-x-6" : "translate-x-0.5"
                              }`} />
                            </button>
                          </div>

                          {audioOptions.enableNarration && (
                            <div className="space-y-3 pl-6">
                              <div>
                                <label className="block text-xs text-zinc-400 mb-2">나레이션 스타일</label>
                                <div className="grid grid-cols-5 gap-2">
                                  {[
                                    { id: "documentary", name: "다큐", icon: "📹" },
                                    { id: "storytelling", name: "스토리텔링", icon: "📖" },
                                    { id: "dramatic", name: "드라마틱", icon: "🎭" },
                                    { id: "casual", name: "캐주얼", icon: "💬" },
                                    { id: "professional", name: "전문적", icon: "👔" },
                                  ].map((style) => (
                                    <button
                                      key={style.id}
                                      onClick={() => setAudioOptions({ ...audioOptions, narrationStyle: style.id })}
                                      className={`p-2 rounded-lg text-xs transition-colors ${
                                        audioOptions.narrationStyle === style.id
                                          ? "bg-green-600 text-white"
                                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                      }`}
                                    >
                                      <span className="mr-1">{style.icon}</span>
                                      {style.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs text-zinc-400 mb-2">목소리</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {[
                                      { id: "male", name: "남성", icon: "👨" },
                                      { id: "female", name: "여성", icon: "👩" },
                                      { id: "neutral", name: "중성", icon: "🧑" },
                                    ].map((voice) => (
                                      <button
                                        key={voice.id}
                                        onClick={() => setAudioOptions({ ...audioOptions, narrationVoice: voice.id })}
                                        className={`p-2 rounded-lg text-xs transition-colors ${
                                          audioOptions.narrationVoice === voice.id
                                            ? "bg-green-600 text-white"
                                            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                        }`}
                                      >
                                        <span className="mr-1">{voice.icon}</span>
                                        {voice.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-zinc-400 mb-2">언어</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { id: "korean", name: "한국어", icon: "🇰🇷" },
                                      { id: "english", name: "English", icon: "🇺🇸" },
                                    ].map((lang) => (
                                      <button
                                        key={lang.id}
                                        onClick={() => setAudioOptions({ ...audioOptions, narrationLanguage: lang.id })}
                                        className={`p-2 rounded-lg text-xs transition-colors ${
                                          audioOptions.narrationLanguage === lang.id
                                            ? "bg-green-600 text-white"
                                            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                        }`}
                                      >
                                        <span className="mr-1">{lang.icon}</span>
                                        {lang.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 오디오 요약 */}
                        {(audioOptions.enableMusic || audioOptions.enableSoundEffects || audioOptions.enableNarration) && (
                          <div className="p-3 bg-zinc-700/50 rounded-lg">
                            <p className="text-xs text-zinc-400 mb-2">선택된 오디오 옵션:</p>
                            <div className="flex flex-wrap gap-2">
                              {audioOptions.enableMusic && (
                                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                                  🎵 {audioOptions.musicStyle === "custom" ? audioOptions.customMusicStyle : audioOptions.musicStyle} / {audioOptions.musicMood}
                                </span>
                              )}
                              {audioOptions.enableSoundEffects && (
                                <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                                  🔊 효과음 포함
                                </span>
                              )}
                              {audioOptions.enableNarration && (
                                <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                                  🎙️ {audioOptions.narrationStyle} / {audioOptions.narrationVoice} / {audioOptions.narrationLanguage}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
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

            {/* 예상 비용 표시 */}
            {(() => {
              const cost = calculateEstimatedCost();
              return (
                <div className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                      💰 예상 비용
                      {cost.hasVideoAudio && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-600/30 text-green-400">
                          효과음/나레이션
                        </span>
                      )}
                      {cost.hasMusic && (
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-600/30 text-purple-400">
                          배경음악
                        </span>
                      )}
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      ₩{cost.totalKRW.toLocaleString()}
                    </span>
                  </div>
                  <div className={`grid ${cost.hasMusic ? "grid-cols-4" : "grid-cols-3"} gap-2 text-xs text-zinc-400`}>
                    <div className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-zinc-500">텍스트</div>
                      <div className="text-white">₩{cost.textCost.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-zinc-500">이미지</div>
                      <div className="text-white">₩{cost.imageCost.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-zinc-800/50 rounded">
                      <div className="text-zinc-500">영상 ({cost.maxDuration}초)</div>
                      <div className="text-white">₩{cost.videoCost.toLocaleString()}</div>
                    </div>
                    {cost.hasMusic && (
                      <div className="p-2 bg-zinc-800/50 rounded">
                        <div className="text-zinc-500">배경음악</div>
                        <div className="text-white">₩{cost.musicCost.toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    * 영상: {sceneCount}장면 × {cost.maxDuration}초, ${cost.hasVideoAudio ? "$0.40" : "$0.20"}/초
                    {cost.hasMusic && ` | 음악: $0.01/초`} (총 ${cost.totalUSD} USD)
                  </p>
                </div>
              );
            })()}

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
                          <div className="space-y-2">
                            {selectedCharacters.map((char) => {
                              const hasValidImages = [...(char.referenceImages || []), ...(char.generatedImages || [])]
                                .some((img: string) => img && (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')));
                              const currentMode = characterImageModes[char.id] || (hasValidImages ? "ai_reference" : "ai_create");
                              return (
                                <div
                                  key={char.id}
                                  className="p-2 bg-zinc-800 rounded-lg"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      {(char.referenceImages?.[0] || char.generatedImages?.[0]) ? (
                                        <img
                                          src={char.referenceImages?.[0] || char.generatedImages?.[0]}
                                          alt={char.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                          <Users className="w-4 h-4 text-zinc-500" />
                                        </div>
                                      )}
                                      <span className="text-sm font-medium text-white">{char.name}</span>
                                    </div>
                                    <button
                                      onClick={() => toggleCharacter(char)}
                                      className="text-zinc-500 hover:text-white"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setCharacterImageMode(char.id, "attached")}
                                      disabled={!hasValidImages}
                                      className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                                        currentMode === "attached"
                                          ? "bg-blue-600 text-white"
                                          : hasValidImages
                                            ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                      }`}
                                      title="첨부된 이미지를 그대로 사용"
                                    >
                                      첨부 사용
                                    </button>
                                    <button
                                      onClick={() => setCharacterImageMode(char.id, "ai_reference")}
                                      disabled={!hasValidImages}
                                      className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                                        currentMode === "ai_reference"
                                          ? "bg-green-600 text-white"
                                          : hasValidImages
                                            ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                            : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                      }`}
                                      title="AI가 참조 이미지를 기반으로 캐릭터 생성"
                                    >
                                      AI 참조
                                    </button>
                                    <button
                                      onClick={() => setCharacterImageMode(char.id, "ai_create")}
                                      className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                                        currentMode === "ai_create"
                                          ? "bg-purple-600 text-white"
                                          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                      }`}
                                      title="AI가 새로운 캐릭터 이미지 생성"
                                    >
                                      새로 생성
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 주제 입력 필드 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-white">영상 주제 및 상세 설명</h3>
                  <span className="text-xs text-zinc-500">자동 저장됨</span>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">주제 *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="예: 옥토퍼스맨의 도시 모험"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">배경</label>
                  <input
                    type="text"
                    value={topicBackground}
                    onChange={(e) => setTopicBackground(e.target.value)}
                    placeholder="예: 현대 도시의 밤거리, 네온사인이 빛나는 번화가"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">분위기</label>
                  <input
                    type="text"
                    value={topicMood}
                    onChange={(e) => setTopicMood(e.target.value)}
                    placeholder="예: 긴장감 있는 액션, 신비로운 분위기"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">주요 장면</label>
                  <textarea
                    value={topicScenes}
                    onChange={(e) => setTopicScenes(e.target.value)}
                    placeholder="예: 빌딩 사이를 날아다니는 히어로, 악당과의 대결, 승리 후 도시를 바라보는 장면"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 min-h-[80px] resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">줄거리 (대략적인 스토리)</label>
                  <textarea
                    value={topicStoryline}
                    onChange={(e) => setTopicStoryline(e.target.value)}
                    placeholder="예: 평범한 청년이 우연히 초능력을 얻게 되고, 도시를 위협하는 악당과 맞서 싸운다. 처음에는 두려움에 떨지만, 점차 자신감을 얻어 마침내 승리한다."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 min-h-[100px] resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">특별한 요청사항</label>
                  <textarea
                    value={topicSpecial}
                    onChange={(e) => setTopicSpecial(e.target.value)}
                    placeholder="예: 슬로우모션 연출, 특정 색감 강조 등"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 min-h-[60px] resize-y"
                  />
                </div>
                <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
                  <p className="text-xs text-zinc-400">
                    <span className="text-purple-400 font-medium">등장인물</span>은 위 &quot;등장인물 선택&quot; 섹션에서 선택해주세요. 선택된 캐릭터가 스크립트에 자동 반영됩니다.
                  </p>
                </div>
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
              </>
            )}
          </div>
        )}

        {/* Step 2: Script Review */}
        {step === "script" && (
          <div className="space-y-6">
            {/* 이전 단계로 돌아가기 버튼 */}
            <button
              onClick={() => setStep("topic")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">주제 설정으로 돌아가기</span>
            </button>

            {/* 대사(말풍선) 옵션 */}
            <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium text-white">대사 (말풍선) 옵션</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDialogue}
                    onChange={(e) => setEnableDialogue(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
              {enableDialogue && (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-400">
                    이미지에 말풍선을 추가합니다. 아래 장면별로 대사를 입력하거나 AI가 자동으로 생성하도록 할 수 있습니다.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={generateDialoguesWithAI}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-600 rounded-lg text-white text-sm transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      AI로 대사 자동 생성
                    </button>
                    <span className="text-xs text-zinc-500">
                      각 장면의 내용을 바탕으로 AI가 적절한 대사를 생성합니다
                    </span>
                  </div>
                </div>
              )}
            </div>

            {imagePrompts.map((scene, sceneIndex) => (
              <div key={scene.id} className="border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">장면 {sceneIndex + 1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => regenerateSingleSceneScript(sceneIndex)}
                      disabled={loading}
                      className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1 px-2 py-1 rounded bg-yellow-600/20 disabled:opacity-50"
                      title="이 장면의 스크립트만 재생성"
                    >
                      <RefreshCw className="w-3 h-3" />
                      스크립트 재생성
                    </button>
                    <button
                      type="button"
                      onClick={() => generateSingleSceneImages(sceneIndex)}
                      disabled={loading}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded bg-green-600/20 disabled:opacity-50"
                      title="이 장면의 이미지만 생성"
                    >
                      <ImageIcon className="w-3 h-3" />
                      {generatedImages[sceneIndex]?.images?.length > 0 ? "이미지 재생성" : "이미지 생성"}
                    </button>
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
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs text-zinc-400">카메라 앵글</label>
                          <button
                            onClick={() => openAddStyleOptionModal("cameraAngle")}
                            className="p-0.5 bg-purple-600/20 hover:bg-purple-600/40 rounded text-purple-400 transition-colors"
                            title="커스텀 앵글 추가"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {/* Custom camera angles */}
                          {getCustomOptionsForType("cameraAngle").map((option) => (
                            <div key={option.id} className="relative group">
                              <button
                                onClick={() => updateSceneSettings(sceneIndex, "cameraAngle", option.optionId)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                  scene.settings.cameraAngle === option.optionId
                                    ? "bg-blue-600 text-white"
                                    : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                                }`}
                              >
                                {option.icon} {option.name}
                              </button>
                              <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                                <button onClick={() => openEditStyleOptionModal(option)} className="p-0.5 bg-blue-600 rounded text-white"><Edit2 className="w-2 h-2" /></button>
                                <button onClick={() => deleteStyleOption(option.id)} className="p-0.5 bg-red-600 rounded text-white"><Trash2 className="w-2 h-2" /></button>
                              </div>
                            </div>
                          ))}
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
                    { label: "시작 프레임 (정적 이미지)", value: scene.prompt1, index: 0 },
                    { label: "끝 프레임 (정적 이미지)", value: scene.prompt2, index: 1 },
                  ].map((frame) => (
                    <div key={frame.index}>
                      <label className="block text-xs text-zinc-500 mb-1">{frame.label}</label>
                      <textarea
                        value={frame.value}
                        onChange={(e) => updatePrompt(sceneIndex, frame.index, e.target.value)}
                        readOnly={editingScene !== sceneIndex}
                        rows={8}
                        className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-white resize-y min-h-[160px] ${
                          editingScene === sceneIndex ? "border-purple-500" : "border-zinc-700"
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* 장면별 비디오 모션 프롬프트 */}
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-blue-400" />
                    <label className="text-sm text-blue-400 font-medium">비디오 모션 프롬프트</label>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">
                    카메라 움직임, 피사체 동작, 전환 효과 등 동적 연출을 상세히 묘사합니다
                  </p>
                  <textarea
                    value={scene.videoPrompt || ""}
                    onChange={(e) => {
                      const newPrompts = [...imagePrompts];
                      newPrompts[sceneIndex].videoPrompt = e.target.value;
                      setImagePrompts(newPrompts);
                    }}
                    readOnly={editingScene !== sceneIndex}
                    rows={10}
                    placeholder="예: 카메라가 천천히 줌인하며, 캐릭터가 왼쪽에서 오른쪽으로 걸어간다. 배경의 나뭇잎이 바람에 흔들리고..."
                    className={`w-full bg-zinc-800 border rounded-lg px-3 py-2 text-sm text-white resize-y min-h-[200px] ${
                      editingScene === sceneIndex ? "border-blue-500" : "border-zinc-700"
                    }`}
                  />
                </div>

                {/* 대사 입력 (대사 옵션이 켜져 있을 때만 표시) */}
                {enableDialogue && (
                  <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">대사 (말풍선)</span>
                      <span className="text-xs text-yellow-600">이미지에 말풍선이 추가됩니다</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">시작 프레임 대사</label>
                        <input
                          type="text"
                          value={scene.dialogue1 || ""}
                          onChange={(e) => {
                            const updated = [...imagePrompts];
                            updated[sceneIndex] = { ...updated[sceneIndex], dialogue1: e.target.value };
                            setImagePrompts(updated);
                          }}
                          placeholder="예: 안녕하세요!"
                          className="w-full bg-zinc-800 border border-yellow-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">끝 프레임 대사</label>
                        <input
                          type="text"
                          value={scene.dialogue2 || ""}
                          onChange={(e) => {
                            const updated = [...imagePrompts];
                            updated[sceneIndex] = { ...updated[sceneIndex], dialogue2: e.target.value };
                            setImagePrompts(updated);
                          }}
                          placeholder="예: 그럼 이만!"
                          className="w-full bg-zinc-800 border border-yellow-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

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
                    {loadingStep.includes("스크립트") || loadingStep.includes("촬영 설정") ? loadingStep : "이미지 생성 중..."}
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
            {/* 다운로드 경고 배너 */}
            {!imagesDownloaded && (
              <div className="bg-amber-900/50 border border-amber-600 rounded-xl p-4 flex items-start gap-3">
                <div className="text-amber-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-amber-200 font-medium">이미지를 다운로드하지 않으면 삭제됩니다</p>
                  <p className="text-amber-300/70 text-sm mt-1">
                    생성된 이미지는 서버에 임시 저장됩니다. 페이지를 떠나면 삭제되므로 반드시 다운로드해주세요.
                  </p>
                </div>
                <button
                  onClick={downloadAllImages}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  전체 다운로드
                </button>
              </div>
            )}

            {/* 다운로드 완료 표시 */}
            {imagesDownloaded && (
              <div className="bg-green-900/30 border border-green-600 rounded-xl p-4 flex items-center gap-3">
                <div className="text-green-400 text-xl">✅</div>
                <p className="text-green-200">이미지 다운로드 완료</p>
              </div>
            )}

            {/* 이전 단계로 돌아가기 버튼 */}
            <button
              onClick={() => setStep("script")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">스크립트 수정으로 돌아가기</span>
            </button>

            {generatedImages.map((scene, sceneIndex) => (
              <div key={scene.id} className="border border-zinc-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">장면 {sceneIndex + 1}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => generateSingleSceneImages(sceneIndex)}
                      disabled={loading}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2 py-1 rounded bg-purple-600/20 disabled:opacity-50"
                      title="이 장면의 이미지 전체 재생성"
                    >
                      <ImageIcon className="w-3 h-3" />
                      이미지 재생성
                    </button>
                    <button
                      type="button"
                      onClick={() => generateSingleSceneVideo(sceneIndex)}
                      disabled={loading}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 px-2 py-1 rounded bg-green-600/20 disabled:opacity-50"
                      title="이 장면만 영상 생성"
                    >
                      <Video className="w-3 h-3" />
                      {videoUrls[sceneIndex] ? "영상 재생성" : "영상 생성"}
                    </button>
                  </div>
                </div>
                {/* 기존 생성된 영상이 있으면 표시 */}
                {videoUrls[sceneIndex] && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-green-600/30 bg-zinc-900">
                    <video src={videoUrls[sceneIndex]} controls className="w-full aspect-video bg-black" />
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {scene.images.map((imageUrl, imgIndex) => (
                    <div key={imgIndex} className="relative group">
                      <div className="rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 flex items-center justify-center min-h-[120px] max-h-[400px]">
                        <img
                          src={imageUrl}
                          alt={`Scene ${sceneIndex + 1} Frame ${imgIndex + 1}`}
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => downloadImage(imageUrl, `장면${sceneIndex + 1}_${["시작", "끝"][imgIndex] || imgIndex + 1}.png`)}
                          className="p-2 bg-green-600/80 rounded-lg text-white hover:bg-green-600"
                          title="이미지 다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => regenerateSceneImage(sceneIndex, imgIndex)}
                          disabled={loading}
                          className="p-2 bg-blue-600/80 rounded-lg text-white hover:bg-blue-600"
                          title="이 프레임만 재생성"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-1 text-center">
                        <p className="text-xs text-zinc-500">
                          {["시작", "끝"][imgIndex]} 프레임
                        </p>
                      </div>
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
                disabled={loading || !allScenesHaveImages}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-xl font-medium text-white flex items-center justify-center gap-2"
                title={!allScenesHaveImages ? `이미지가 없는 장면: ${scenesWithoutImages.map(i => i + 1).join(", ")}` : ""}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    영상 생성 중...
                  </>
                ) : !allScenesHaveImages ? (
                  <>
                    <Video className="w-5 h-5" />
                    이미지 먼저 생성
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
        {step === "done" && videoUrls.length > 0 && (
          <div className="space-y-6">
            {/* 영상 다운로드 경고 배너 */}
            {!videoDownloaded && (
              <div className="bg-amber-900/50 border border-amber-600 rounded-xl p-4 flex items-start gap-3">
                <div className="text-amber-400 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-amber-200 font-medium">영상을 다운로드하지 않으면 삭제됩니다</p>
                  <p className="text-amber-300/70 text-sm mt-1">
                    생성된 영상은 서버에 임시 저장됩니다. 페이지를 떠나면 삭제되므로 반드시 다운로드해주세요.
                  </p>
                </div>
                <button
                  onClick={downloadAllVideos}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-white flex items-center gap-2 text-sm font-medium whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  전체 다운로드
                </button>
              </div>
            )}

            {/* 다운로드 완료 표시 */}
            {videoDownloaded && (
              <div className="bg-green-900/30 border border-green-600 rounded-xl p-4 flex items-center gap-3">
                <div className="text-green-400 text-xl">✅</div>
                <p className="text-green-200">영상 다운로드 완료</p>
              </div>
            )}

            {/* 이전 단계로 돌아가기 버튼 */}
            <button
              onClick={() => setStep("image")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">이미지 확인으로 돌아가기</span>
            </button>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-400">생성된 영상 ({videoUrls.filter(url => url).length}개)</p>
                <button
                  onClick={downloadAllVideos}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-white flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  전체 다운로드
                </button>
              </div>
              {/* 장면별 영상 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoUrls.map((url, idx) => (
                  <div key={idx} className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-900">
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
                      <span className="text-sm font-medium text-white">장면 {idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => generateSingleSceneVideo(idx)}
                          disabled={loading}
                          className="px-2 py-1 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 rounded text-xs text-white flex items-center gap-1"
                          title="이 장면의 영상만 재생성"
                        >
                          <RefreshCw className="w-3 h-3" />
                          재생성
                        </button>
                        {url && (
                          <button
                            onClick={() => downloadSingleVideo(url, idx)}
                            className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs text-white flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            다운로드
                          </button>
                        )}
                      </div>
                    </div>
                    {url ? (
                      <video src={url} controls className="w-full aspect-video bg-black" />
                    ) : (
                      <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center flex-col gap-2">
                        <span className="text-zinc-500 text-sm">생성 실패</span>
                        <button
                          type="button"
                          onClick={() => generateSingleSceneVideo(idx)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg text-xs text-white flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          다시 생성
                        </button>
                      </div>
                    )}
                    {/* 해당 장면에 사용된 이미지 */}
                    {generatedImages[idx] && (
                      <div className="p-2 border-t border-zinc-700">
                        <p className="text-xs text-zinc-500 mb-1">사용된 이미지</p>
                        <div className="flex gap-1">
                          {generatedImages[idx].images.map((img, imgIdx) => (
                            <div key={imgIdx} className="w-12 h-12 rounded overflow-hidden border border-zinc-600">
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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

            {/* 배경음악 생성 섹션 */}
            <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  배경음악 생성
                </h4>
                <button
                  onClick={generateMusicPromptFromTopic}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  자동 프롬프트 생성
                </button>
              </div>

              <div className="space-y-3">
                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="음악 스타일을 설명해주세요. 예: upbeat electronic music with energetic drums, cinematic orchestral score, calm acoustic guitar melody..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 resize-none"
                  rows={2}
                />

                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400">길이:</label>
                  <select
                    value={musicDuration}
                    onChange={(e) => setMusicDuration(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white"
                  >
                    <option value={10}>10초</option>
                    <option value={15}>15초</option>
                    <option value={20}>20초</option>
                    <option value={30}>30초 (최대)</option>
                  </select>

                  <button
                    onClick={generateMusic}
                    disabled={generatingMusic || !musicPrompt.trim()}
                    className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2"
                  >
                    {generatingMusic ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        생성 중...
                      </>
                    ) : (
                      <>
                        <Music className="w-4 h-4" />
                        음악 생성
                      </>
                    )}
                  </button>
                </div>

                {musicUrl && (
                  <div className="mt-3 p-3 bg-zinc-900 rounded-lg border border-green-700/50">
                    <p className="text-xs text-green-400 mb-2">✓ 음악이 생성되었습니다!</p>
                    <audio controls className="w-full mb-2" src={musicUrl}>
                      브라우저가 오디오 재생을 지원하지 않습니다.
                    </audio>
                    <a
                      href={musicUrl}
                      download="background-music.mp3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium text-white"
                    >
                      <Download className="w-3 h-3" />
                      음악 다운로드 (MP3)
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadAllVideos}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl font-medium text-white flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                전체 영상 다운로드 ({videoUrls.filter(url => url).length}개)
              </button>
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

      {/* Custom Style Option Modal */}
      {showStyleOptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Plus className="w-5 h-5 inline mr-2" />
              {editingStyleOption ? "커스텀 옵션 수정" : "커스텀 옵션 추가"}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {(() => {
                const typeNames: Record<string, string> = {
                  genre: "장르", mood: "분위기", visualStyle: "비주얼 스타일",
                  cameraAngle: "카메라 앵글", shotSize: "샷 크기", cameraMovement: "카메라 움직임",
                  pacing: "속도감", transitionStyle: "전환 효과", colorGrade: "색보정",
                  timeSetting: "시간대", weatherSetting: "날씨"
                };
                return `${typeNames[styleOptionForm.type] || styleOptionForm.type} 카테고리에 커스텀 옵션을 추가합니다.`;
              })()}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">이름 *</label>
                <input
                  type="text"
                  value={styleOptionForm.name}
                  onChange={(e) => setStyleOptionForm({ ...styleOptionForm, name: e.target.value })}
                  placeholder="예: 다크 판타지"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">설명 (선택)</label>
                <input
                  type="text"
                  value={styleOptionForm.description}
                  onChange={(e) => setStyleOptionForm({ ...styleOptionForm, description: e.target.value })}
                  placeholder="이 옵션에 대한 설명"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">아이콘 선택</label>
                <div className="flex flex-wrap gap-2">
                  {["🎬", "🎨", "💥", "💭", "🌟", "✨", "🔥", "❄️", "🌙", "☀️", "🌈", "💫", "⚡", "🎭", "🎪", "🏰"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setStyleOptionForm({ ...styleOptionForm, icon: emoji })}
                      className={`w-10 h-10 rounded-lg text-xl transition-all ${
                        styleOptionForm.icon === emoji
                          ? "bg-purple-600 scale-110"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStyleOptionModal(false);
                  setEditingStyleOption(null);
                }}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                취소
              </button>
              <button
                onClick={saveStyleOption}
                disabled={!styleOptionForm.name.trim()}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 rounded-xl text-white flex items-center justify-center gap-2"
              >
                {editingStyleOption ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingStyleOption ? "수정" : "추가"}
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
              {editingPreset ? "스타일 프리셋 수정" : "스타일 프리셋 저장"}
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              {editingPreset
                ? "프리셋 이름, 설명, 아이콘을 수정합니다. 현재 스타일 설정으로 업데이트됩니다."
                : "현재 설정한 스타일 옵션과 선택한 캐릭터를 프리셋으로 저장합니다."}
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
                  setEditingPreset(null);
                  setPresetName("");
                  setPresetDescription("");
                  setPresetIcon("🎬");
                }}
                className="flex-1 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white"
              >
                취소
              </button>
              <button
                onClick={editingPreset ? updateUserPreset : saveCurrentAsPreset}
                disabled={!presetName}
                className={`flex-1 py-3 ${editingPreset ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} disabled:bg-zinc-700 rounded-xl text-white flex items-center justify-center gap-2`}
              >
                {editingPreset ? <Edit2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {editingPreset ? "수정" : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
