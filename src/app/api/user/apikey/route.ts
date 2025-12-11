import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: API 키 조회
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { replicateKey: true },
  });

  return NextResponse.json({
    hasKey: !!user?.replicateKey,
    key: user?.replicateKey ? `${user.replicateKey.slice(0, 8)}...` : null,
  });
}

// POST: API 키 저장
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { apiKey } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { replicateKey: apiKey },
  });

  return NextResponse.json({ success: true });
}

// DELETE: API 키 삭제
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { replicateKey: null },
  });

  return NextResponse.json({ success: true });
}
