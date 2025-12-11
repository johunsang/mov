import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: 생성 기록 조회
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");

  const generations = await prisma.generation.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ generations });
}

// POST: 새 생성 기록 저장
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const data = await request.json();

  const generation = await prisma.generation.create({
    data: {
      type: data.type,
      prompt: data.prompt,
      model: data.model,
      resultUrl: data.resultUrl,
      status: data.status || "completed",
      metadata: data.metadata,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, generation });
}
