// 가격은 USD 기준 (Replicate API 기준 추정치)
export const VIDEO_MODELS = {
  "veo-3.1": {
    id: "google/veo-3.1",
    name: "Google Veo 3.1",
    description: "레퍼런스 이미지 지원",
    supportsReferenceImages: true,
    pricePerRun: 0.50, // $0.50 per video
  },
  "kling-v2.5": {
    id: "kwaivgi/kling-v2.5-turbo-pro",
    name: "Kling v2.5 Turbo Pro",
    description: "빠른 영상 생성",
    supportsReferenceImages: false,
    pricePerRun: 0.35, // $0.35 per video
  },
};

export const IMAGE_MODELS = {
  "nano-banana-pro": {
    id: "google/nano-banana-pro",
    name: "Nano Banana Pro",
    description: "고품질 이미지 생성",
    pricePerRun: 0.02, // $0.02 per image
  },
};

export const IMAGE_TO_VIDEO_MODELS = {
  "kling-i2v": {
    id: "kwaivgi/kling-v2.5-turbo-image-to-video",
    name: "Kling v2.5 I2V",
    description: "이미지→영상 변환",
    pricePerSecondWithAudio: 0.40, // $0.40/초 (오디오 포함)
    pricePerSecondWithoutAudio: 0.20, // $0.20/초 (오디오 미포함)
    maxDuration: 10, // Kling 최대 10초
  },
  "veo-i2v": {
    id: "google/veo-3.1",
    name: "Veo 3.1 (레퍼런스)",
    description: "레퍼런스 이미지로 영상 생성",
    pricePerSecondWithAudio: 0.40, // $0.40/초 (오디오 포함)
    pricePerSecondWithoutAudio: 0.20, // $0.20/초 (오디오 미포함)
    maxDuration: 8, // Veo 최대 8초
  },
};

export const TEXT_MODELS = {
  gemini: {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "빠른 텍스트/이미지 분석",
    supportsImages: true,
    pricePerRun: 0.001, // $0.001 per call
  },
  gpt: {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "OpenAI 최신 모델",
    supportsImages: true,
    pricePerRun: 0.003, // $0.003 per call
  },
  claude: {
    id: "anthropic/claude-4.5-sonnet",
    name: "Claude 4.5 Sonnet",
    description: "Anthropic 최신 모델",
    supportsImages: false,
    pricePerRun: 0.003, // $0.003 per call
  },
};

// 음악 생성 모델 (별도 비용)
export const MUSIC_MODELS = {
  "musicgen": {
    id: "meta/musicgen",
    name: "MusicGen",
    description: "AI 배경음악 생성",
    pricePerSecond: 0.01, // $0.01/초 (추정)
  },
};

// 환율 (2024년 12월 기준, 실제 환율은 변동됨)
export const USD_TO_KRW = 1450;

export type VideoModelKey = keyof typeof VIDEO_MODELS;
export type ImageModelKey = keyof typeof IMAGE_MODELS;
export type ImageToVideoModelKey = keyof typeof IMAGE_TO_VIDEO_MODELS;
export type TextModelKey = keyof typeof TEXT_MODELS;
