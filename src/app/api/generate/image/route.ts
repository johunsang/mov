import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { IMAGE_MODELS, ImageModelKey } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model, prompt, aspectRatio = "16:9" } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });
    const modelConfig = IMAGE_MODELS[model as ImageModelKey];

    if (!modelConfig) {
      return NextResponse.json({ error: "알 수 없는 모델입니다" }, { status: 400 });
    }

    const input = {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: "png",
    };

    const output = await replicate.run(modelConfig.id as `${string}/${string}`, { input });

    const url = typeof (output as { url?: () => string }).url === "function"
      ? (output as { url: () => string }).url()
      : output;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "이미지 생성 실패" },
      { status: 500 }
    );
  }
}
