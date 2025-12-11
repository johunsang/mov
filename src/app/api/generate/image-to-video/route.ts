import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { IMAGE_TO_VIDEO_MODELS, ImageToVideoModelKey } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model, imageUrl, prompt, duration = 5 } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });
    const modelConfig = IMAGE_TO_VIDEO_MODELS[model as ImageToVideoModelKey];

    if (!modelConfig) {
      return NextResponse.json({ error: "알 수 없는 모델입니다" }, { status: 400 });
    }

    let input: Record<string, unknown> = {};

    if (model === "kling-i2v") {
      input = {
        image: imageUrl,
        prompt: prompt || "",
        duration,
      };
    } else if (model === "veo-i2v") {
      input = {
        prompt,
        reference_images: [imageUrl],
      };
    }

    const output = await replicate.run(modelConfig.id as `${string}/${string}`, { input });

    const url = typeof (output as { url?: () => string }).url === "function"
      ? (output as { url: () => string }).url()
      : output;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image to video error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "영상 변환 실패" },
      { status: 500 }
    );
  }
}
