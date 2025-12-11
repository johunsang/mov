import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 단일 프롬프트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const prompt = await prisma.prompt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!prompt) {
    return NextResponse.json({ error: "프롬프트를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ prompt });
}

// PUT: 프롬프트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const data = await request.json();

  const existing = await prisma.prompt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "프롬프트를 찾을 수 없습니다" }, { status: 404 });
  }

  const prompt = await prisma.prompt.update({
    where: { id: params.id },
    data: {
      name: data.name ?? existing.name,
      type: data.type ?? existing.type,
      prompt: data.prompt ?? existing.prompt,
      videoPrompt: data.videoPrompt ?? existing.videoPrompt,
      model: data.model ?? existing.model,
      imageModel: data.imageModel ?? existing.imageModel,
      videoModel: data.videoModel ?? existing.videoModel,
      referenceImages: data.referenceImages ?? existing.referenceImages,
      aspectRatio: data.aspectRatio ?? existing.aspectRatio,
    },
  });

  return NextResponse.json({ success: true, prompt });
}

// DELETE: 프롬프트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const existing = await prisma.prompt.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "프롬프트를 찾을 수 없습니다" }, { status: 404 });
  }

  await prisma.prompt.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
