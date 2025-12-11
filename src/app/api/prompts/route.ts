import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 프롬프트 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const prompts = await prisma.prompt.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ prompts });
}

// POST: 새 프롬프트 저장
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const data = await request.json();

  const prompt = await prisma.prompt.create({
    data: {
      name: data.name,
      type: data.type,
      prompt: data.prompt,
      videoPrompt: data.videoPrompt,
      model: data.model,
      imageModel: data.imageModel,
      videoModel: data.videoModel,
      referenceImages: data.referenceImages,
      aspectRatio: data.aspectRatio,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, prompt });
}
