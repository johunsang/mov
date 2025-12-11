export interface Prompt {
  id: string;
  name: string;
  type: "video" | "image" | "workflow";
  prompt: string;
  videoPrompt?: string;
  model: string;
  imageModel?: string;
  videoModel?: string;
  referenceImages?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerationResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface WorkflowResult {
  topic: string;
  imagePrompt: string;
  videoPrompt: string;
  imageUrl: string;
  videoUrl: string;
}
