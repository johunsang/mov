import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: API 키 조회
export async function GET() {
  try {
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
  } catch (error) {
    console.error("API Key GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 실패" },
      { status: 500 }
    );
  }
}

// POST: API 키 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    const { apiKey } = await request.json();

    // upsert를 사용하여 사용자가 없으면 생성
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: { replicateKey: apiKey },
      create: {
        id: session.user.id,
        email: session.user.email || `${session.user.id}@hwasubun.ai`,
        password: "",
        name: session.user.name || "화수분 사용자",
        replicateKey: apiKey,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Key POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "저장 실패" },
      { status: 500 }
    );
  }
}

// DELETE: API 키 삭제
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 사용자가 있으면 업데이트, 없으면 무시
    await prisma.user.updateMany({
      where: { id: session.user.id },
      data: { replicateKey: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Key DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "삭제 실패" },
      { status: 500 }
    );
  }
}
