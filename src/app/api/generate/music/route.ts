import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, prompt, duration = 30 } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    // MusicGen 모델 사용 (meta/musicgen)
    const output = await replicate.run(
      "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedber",
      {
        input: {
          prompt: prompt,
          duration: Math.min(duration, 30), // 최대 30초
          model_version: "stereo-melody-large",
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }
    );

    return NextResponse.json({ success: true, url: output });
  } catch (error) {
    console.error("Music generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "음악 생성 실패" },
      { status: 500 }
    );
  }
}
