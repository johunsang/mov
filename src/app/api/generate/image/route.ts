import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { IMAGE_MODELS, ImageModelKey } from "@/lib/models";

const PUBLIC_DOMAIN = "https://mov.hwasubun.ai";

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
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    const replicate = new Replicate({ auth: apiKey });

    // 모델 선택 - 기본값은 nano-banana-pro
    const modelKey = (model && IMAGE_MODELS[model as ImageModelKey]) ? model : "nano-banana-pro";
    const modelConfig = IMAGE_MODELS[modelKey as ImageModelKey];

    if (!modelConfig) {
      return NextResponse.json(
        { error: "Unknown model" },
        { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
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

      // 참조 이미지 처리 - 모든 이미지를 공개 URL로 변환
      if (referenceImages && referenceImages.length > 0) {
        const processedImages: string[] = [];

        for (const img of referenceImages) {
          if (!img || typeof img !== 'string') continue;

          // 이미 공개 URL인 경우 그대로 사용
          if (img.startsWith('https://') || img.startsWith('http://')) {
            processedImages.push(img);
            continue;
          }

          // 로컬 경로인 경우 공개 URL로 변환
          // /api/uploads/userId/filename -> https://mov.hwasubun.ai/uploads/userId/filename
          // /uploads/userId/filename -> https://mov.hwasubun.ai/uploads/userId/filename
          if (img.includes('/uploads/')) {
            let publicPath = img;
            // /api/uploads/ -> /uploads/
            if (img.includes('/api/uploads/')) {
              publicPath = img.replace('/api/uploads/', '/uploads/');
            }
            // 상대 경로를 절대 URL로 변환
            if (publicPath.startsWith('/')) {
              publicPath = `${PUBLIC_DOMAIN}${publicPath}`;
            }
            processedImages.push(publicPath);
            console.log(`[API Image] 로컬 이미지 URL 변환: ${img} -> ${publicPath}`);
            continue;
          }

          // 다른 상대 경로도 공개 URL로 변환
          if (img.startsWith('/')) {
            processedImages.push(`${PUBLIC_DOMAIN}${img}`);
          }
        }

        console.log(`[API Image] 참조 이미지 분석:`, {
          total: referenceImages.length,
          processed: processedImages.length,
          urls: processedImages.slice(0, 3).map(u => u.substring(0, 60) + '...'),
        });

        if (processedImages.length > 0) {
          baseInput.image_input = processedImages.slice(0, 14);
          console.log(`[API Image] ${processedImages.length}개 참조 이미지 사용`);
        } else {
          console.log(`[API Image] 유효한 참조 이미지 없음 - 참조 이미지 없이 생성`);
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

    console.log("[API Image] Replicate 응답 타입:", typeof output, Array.isArray(output) ? "array" : "", output?.constructor?.name);

    // Replicate API 응답 형식 처리 - URL 객체 또는 문자열 처리
    let url: string = "";

    try {
      // URL 객체에서 href 추출하는 헬퍼 함수
      const extractUrl = (item: unknown): string => {
        if (!item) return "";

        // 이미 문자열인 경우
        if (typeof item === 'string') return item;

        // 객체인 경우 - 직접 href 접근 시도
        if (typeof item === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = item as any;

          // 직접 href 속성 접근 (URL 객체 포함 모든 객체에서 작동)
          try {
            if (obj.href && typeof obj.href === 'string' && obj.href.startsWith('http')) {
              console.log("[API Image] href 속성에서 URL 추출:", obj.href.substring(0, 50));
              return obj.href;
            }
          } catch {
            // href 접근 실패
          }

          // url 속성 시도
          try {
            if (typeof obj.url === 'function') {
              const urlResult = obj.url();
              if (typeof urlResult === 'string' && urlResult.startsWith('http')) {
                console.log("[API Image] url() 메서드에서 URL 추출");
                return urlResult;
              }
            }
            if (typeof obj.url === 'string' && obj.url.startsWith('http')) {
              console.log("[API Image] url 속성에서 URL 추출");
              return obj.url;
            }
          } catch {
            // url 접근 실패
          }

          // toString 시도
          try {
            const str = String(item);
            if (str.startsWith('http')) {
              console.log("[API Image] toString에서 URL 추출");
              return str;
            }
          } catch {
            // toString 실패
          }
        }

        return "";
      };

      if (Array.isArray(output)) {
        url = extractUrl(output[0]);
      } else {
        url = extractUrl(output);
      }
    } catch (parseError) {
      console.error("[API Image] 응답 파싱 오류:", parseError);
      url = "";
    }

    // URL이 유효한지 확인
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.error("[API Image] Invalid URL returned:", url, "type:", typeof url);
      return NextResponse.json(
        { error: "Invalid image URL returned from API" },
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
      );
    }

    console.log("[API Image] 생성 완료:", url.substring(0, 80));
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}
