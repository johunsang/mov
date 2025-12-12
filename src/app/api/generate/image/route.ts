import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { IMAGE_MODELS, ImageModelKey } from "@/lib/models";

export async function POST(request: NextRequest) {
  try {
    const {
      apiKey,
      model,
      prompt,
      aspectRatio = "16:9",
      referenceImages = [], // 배열로 변경 (최대 14개)
    } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });
    const modelConfig = IMAGE_MODELS[model as ImageModelKey];

    if (!modelConfig) {
      return NextResponse.json({ error: "알 수 없는 모델입니다" }, { status: 400 });
    }

    // nano-banana-pro API 스펙에 맞게 설정 (seed 지원 안 함)
    // aspect_ratio는 사용자가 입력한 값 그대로 전달 (예: "9:16", "6:19" 등)
    const baseInput: Record<string, unknown> = {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: "png",
      resolution: "2K",
      safety_filter_level: "block_only_high",
    };

    // 참조 이미지가 있으면 image_input 배열로 전달 (나노바나나: 최대 14개)
    // Replicate API는 URL 형식만 허용 (base64, data URI 불가)
    if (referenceImages && referenceImages.length > 0) {
      const validUrls = referenceImages.filter((img: string) =>
        img && typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))
      ).slice(0, 14);

      if (validUrls.length > 0) {
        baseInput.image_input = validUrls;
        console.log(`Using ${validUrls.length} reference images (filtered from ${referenceImages.length})`);
      } else {
        console.log(`No valid URLs found in ${referenceImages.length} reference images (base64/data URI not supported)`);
      }
    }

    console.log("Generating image with model:", modelConfig.id, {
      aspectRatio,
      referenceImagesCount: referenceImages?.length || 0,
    });

    const output = await replicate.run(modelConfig.id as `${string}/${string}`, { input: baseInput });

    // Replicate API 응답 형식 처리:
    // 1. 배열인 경우 (가장 일반적): ["https://..."]
    // 2. 객체인 경우: { url: () => string } 또는 { url: string }
    // 3. 문자열인 경우: "https://..."
    let url: string;

    if (Array.isArray(output)) {
      // 배열이면 첫 번째 요소 사용
      url = output[0] as string;
    } else if (typeof output === "object" && output !== null) {
      const objOutput = output as { url?: (() => string) | string };
      if (typeof objOutput.url === "function") {
        url = objOutput.url();
      } else if (typeof objOutput.url === "string") {
        url = objOutput.url;
      } else {
        url = String(output);
      }
    } else {
      url = String(output);
    }

    console.log("Image generation result URL:", url);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "이미지 생성 실패" },
      { status: 500 }
    );
  }
}
