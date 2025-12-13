import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { VIDEO_MODELS, VideoModelKey } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model, prompt, referenceImages = [] } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });
    const modelConfig = VIDEO_MODELS[model as VideoModelKey];

    if (!modelConfig) {
      return NextResponse.json({ error: "알 수 없는 모델입니다" }, { status: 400 });
    }

    // 글자/말풍선 금지 지시 추가
    const enhancedPrompt = `${prompt}. No text, no speech bubbles, no captions, no letters, no watermarks.`;
    const input: Record<string, unknown> = { prompt: enhancedPrompt };

    if (modelConfig.supportsReferenceImages && referenceImages.length > 0) {
      input.reference_images = referenceImages;
    }

    const output = await replicate.run(modelConfig.id as `${string}/${string}`, { input });

    const url = typeof (output as { url?: () => string }).url === "function"
      ? (output as { url: () => string }).url()
      : output;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "영상 생성 실패" },
      { status: 500 }
    );
  }
}
