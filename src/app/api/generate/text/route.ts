import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, prompt, images = [], model = "gemini", messages = [] } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API 키가 필요합니다" }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    let result = "";

    if (model === "gemini") {
      // Gemini 2.5 Flash
      const input: Record<string, unknown> = { prompt };
      if (images.length > 0) {
        input.images = images;
      }

      for await (const event of replicate.stream("google/gemini-2.5-flash", { input })) {
        result += event;
      }
    } else if (model === "gpt") {
      // GPT-5
      const input = {
        prompt,
        messages: messages || [],
        verbosity: "medium",
        image_input: images || [],
        reasoning_effort: "minimal",
      };

      for await (const event of replicate.stream("openai/gpt-5", { input })) {
        result += event.toString();
      }
    } else {
      // Claude
      const input = {
        prompt,
        max_tokens: 2000,
      };

      for await (const event of replicate.stream("anthropic/claude-4.5-sonnet", { input })) {
        result += event;
      }
    }

    return NextResponse.json({ success: true, text: result.trim() });
  } catch (error) {
    console.error("Text generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "텍스트 생성 실패" },
      { status: 500 }
    );
  }
}
