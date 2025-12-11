import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, topic, type = "image" } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    let systemPrompt = "";
    if (type === "image") {
      systemPrompt = `You are a creative director. Generate a detailed visual description for an image. Be specific about visual elements, lighting, composition, and mood. Keep it under 200 words. Write in English.`;
    } else {
      systemPrompt = `You are a video director. Create a detailed video scene description. Include visual details, camera movement, lighting, and action. Keep it under 150 words. Write in English.`;
    }

    const input = {
      prompt: `${systemPrompt}\n\nTopic: ${topic}\n\nGenerate a detailed ${type} prompt:`,
      max_tokens: 500,
    };

    let result = "";
    for await (const event of replicate.stream("anthropic/claude-4.5-sonnet", { input })) {
      result += event;
    }

    return NextResponse.json({ success: true, script: result.trim() });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "스크립트 생성 실패" },
      { status: 500 }
    );
  }
}
