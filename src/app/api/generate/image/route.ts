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
      referenceImages = [],
    } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    // 모델 선택 - 기본값은 nano-banana-pro
    const modelKey = (model && IMAGE_MODELS[model as ImageModelKey]) ? model : "nano-banana-pro";
    const modelConfig = IMAGE_MODELS[modelKey as ImageModelKey];

    if (!modelConfig) {
      return NextResponse.json({ error: "알 수 없는 모델입니다" }, { status: 400 });
    }

    // 모델별 설정
    const isNanoBanana = modelConfig.id.includes("nano-banana");
    const isFlux = modelConfig.id.includes("flux");

    let baseInput: Record<string, unknown>;

    if (isNanoBanana) {
      // Nano Banana Pro API 스펙
      baseInput = {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: "png",
        resolution: "2K",
        safety_filter_level: "block_only_high",
      };

      // 참조 이미지 처리 - Replicate 공개 URL만 사용
      if (referenceImages && referenceImages.length > 0) {
        // Replicate URL만 필터 (공개 접근 가능한 URL)
        const replicateUrls = referenceImages.filter((img: string) =>
          img && typeof img === 'string' &&
          (img.includes('replicate.delivery') || img.includes('replicate.com') || img.includes('pbxt.replicate.delivery'))
        );

        console.log(`[API Image] 참조 이미지 분석:`, {
          total: referenceImages.length,
          replicateUrls: replicateUrls.length,
        });

        // Replicate URL만 사용 (서버 내부 URL은 제외 - E006 오류 방지)
        if (replicateUrls.length > 0) {
          baseInput.image_input = replicateUrls.slice(0, 14);
          console.log(`[API Image] ${replicateUrls.length}개 Replicate 참조 이미지 사용`);
        } else {
          console.log(`[API Image] 유효한 Replicate 참조 이미지 없음 - 참조 이미지 없이 생성`);
        }
      } else {
        console.log(`[API Image] 참조 이미지 없이 생성`);
      }
    } else if (isFlux) {
      // FLUX 모델 API 스펙
      baseInput = {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: "png",
        output_quality: 90,
      };
      console.log(`[API Image] FLUX 모델 - 참조 이미지 미지원`);
    } else {
      // 기타 모델
      baseInput = {
        prompt,
        aspect_ratio: aspectRatio,
      };
    }

    console.log("[API Image] 생성 요청:", {
      model: modelConfig.id,
      aspectRatio,
      hasImageInput: !!baseInput.image_input,
      imageInputCount: (baseInput.image_input as string[] | undefined)?.length || 0,
    });

    const output = await replicate.run(modelConfig.id as `${string}/${string}`, { input: baseInput });

    console.log("[API Image] Replicate 응답 타입:", typeof output, Array.isArray(output) ? "array" : "");

    // Replicate API 응답 형식 처리
    let url: string = "";

    try {
      if (Array.isArray(output)) {
        const first = output[0];
        if (first && typeof first === 'object') {
          // FileOutput 객체 처리
          if ('href' in first) {
            const hrefValue = (first as { href: unknown }).href;
            url = typeof hrefValue === 'function' ? hrefValue() : String(hrefValue);
          } else if ('url' in first) {
            const urlValue = (first as { url: unknown }).url;
            url = typeof urlValue === 'function' ? urlValue() : String(urlValue);
          } else {
            url = String(first);
          }
        } else if (first) {
          url = String(first);
        }
      } else if (typeof output === "object" && output !== null) {
        // FileOutput 객체 처리
        if ('href' in output) {
          const hrefValue = (output as { href: unknown }).href;
          url = typeof hrefValue === 'function' ? hrefValue() : String(hrefValue);
        } else if ('url' in output) {
          const urlValue = (output as { url: unknown }).url;
          url = typeof urlValue === 'function' ? urlValue() : String(urlValue);
        } else {
          url = String(output);
        }
      } else if (output) {
        url = String(output);
      }
    } catch (parseError) {
      console.error("[API Image] 응답 파싱 오류:", parseError);
      url = "";
    }

    // URL이 유효한지 확인 - 타입 체크 추가
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.error("[API Image] Invalid URL returned:", url, "type:", typeof url);
      return NextResponse.json(
        { error: "유효하지 않은 이미지 URL이 반환되었습니다" },
        { status: 500 }
      );
    }

    console.log("[API Image] 생성 완료:", url.substring(0, 80));
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "이미지 생성 실패" },
      { status: 500 }
    );
  }
}
