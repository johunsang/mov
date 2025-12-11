export const VIDEO_MODELS = {
  "veo-3.1": {
    id: "google/veo-3.1",
    name: "Google Veo 3.1",
    description: "레퍼런스 이미지 지원",
    supportsReferenceImages: true,
  },
  "kling-v2.5": {
    id: "kwaivgi/kling-v2.5-turbo-pro",
    name: "Kling v2.5 Turbo Pro",
    description: "빠른 영상 생성",
    supportsReferenceImages: false,
  },
};

export const IMAGE_MODELS = {
  "nano-banana-pro": {
    id: "google/nano-banana-pro",
    name: "Nano Banana Pro",
    description: "고품질 이미지 생성",
  },
};

export const IMAGE_TO_VIDEO_MODELS = {
  "kling-i2v": {
    id: "kwaivgi/kling-v2.5-turbo-image-to-video",
    name: "Kling v2.5 I2V",
    description: "이미지→영상 변환",
  },
  "veo-i2v": {
    id: "google/veo-3.1",
    name: "Veo 3.1 (레퍼런스)",
    description: "레퍼런스 이미지로 영상 생성",
  },
};

export const TEXT_MODELS = {
  gemini: {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "빠른 텍스트/이미지 분석",
    supportsImages: true,
  },
  gpt: {
    id: "openai/gpt-5",
    name: "GPT-5",
    description: "OpenAI 최신 모델",
    supportsImages: true,
  },
  claude: {
    id: "anthropic/claude-4.5-sonnet",
    name: "Claude 4.5 Sonnet",
    description: "Anthropic 최신 모델",
    supportsImages: false,
  },
};

export type VideoModelKey = keyof typeof VIDEO_MODELS;
export type ImageModelKey = keyof typeof IMAGE_MODELS;
export type ImageToVideoModelKey = keyof typeof IMAGE_TO_VIDEO_MODELS;
export type TextModelKey = keyof typeof TEXT_MODELS;
