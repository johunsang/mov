import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isAdminByEmail, isAdminByUserId } from "@/lib/admin";

// GET: 스타일 옵션 목록 조회 (시스템 + 사용자 커스텀)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // 시스템 옵션 + 자신의 커스텀 옵션 조회
    const where: { type?: string; OR: ({ isSystem: boolean; userId: null } | { userId: string })[] } = {
      OR: [
        { isSystem: true, userId: null },
        { userId: session.user.id },
      ],
    };
    if (type) {
      where.type = type;
    }

    const options = await prisma.styleOption.findMany({
      where,
      orderBy: [
        { isSystem: "desc" }, // 시스템 옵션 먼저
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    // 관리자 여부도 함께 반환 (이메일 또는 userId로 확인)
    const userIsAdmin = isAdminByEmail(session.user.email) || isAdminByUserId(session.user.id);
    return NextResponse.json({
      success: true,
      options,
      isAdmin: userIsAdmin,
    });
  } catch (error) {
    console.error("Style options GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "조회 실패" },
      { status: 500 }
    );
  }
}

// POST: 새 스타일 옵션 추가
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { type, optionId, name, description, icon, isSystem: requestIsSystem, sortOrder, metadata } = await request.json();

    if (!type || !optionId || !name) {
      return NextResponse.json(
        { error: "type, optionId, name은 필수입니다" },
        { status: 400 }
      );
    }

    // 유효한 타입인지 확인
    const validTypes = [
      "genre", "mood", "visualStyle", "lightingStyle", "cameraAngle",
      "shotSize", "cameraMovement", "pacing", "transitionStyle",
      "colorGrade", "timeSetting", "weatherSetting", "format", "duration",
      "cameraStyle"
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "유효하지 않은 타입입니다" }, { status: 400 });
    }

    // 시스템 옵션 추가는 관리자만 가능
    const wantsSystemOption = requestIsSystem === true;
    const userIsAdmin = isAdminByEmail(session.user.email) || isAdminByUserId(session.user.id);
    if (wantsSystemOption && !userIsAdmin) {
      return NextResponse.json({ error: "시스템 옵션은 관리자만 추가할 수 있습니다" }, { status: 403 });
    }

    const option = await prisma.styleOption.create({
      data: {
        type,
        optionId: wantsSystemOption ? optionId : `custom-${optionId.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        description,
        icon: icon || "🎬",
        isSystem: wantsSystemOption,
        sortOrder: sortOrder || 0,
        metadata: metadata || null,
        userId: wantsSystemOption ? null : session.user.id,
      },
    });

    return NextResponse.json({ success: true, option });
  } catch (error) {
    console.error("Style options POST error:", error);
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "이미 존재하는 옵션 ID입니다" }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "생성 실패" },
      { status: 500 }
    );
  }
}

// PUT: 스타일 옵션 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { id, name, description, icon, sortOrder, metadata } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id는 필수입니다" }, { status: 400 });
    }

    // 옵션 조회
    const existing = await prisma.styleOption.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "옵션을 찾을 수 없습니다" }, { status: 404 });
    }

    // 시스템 옵션은 관리자만 수정 가능
    const userIsAdmin = isAdminByEmail(session.user.email) || isAdminByUserId(session.user.id);
    if (existing.isSystem && !userIsAdmin) {
      return NextResponse.json({ error: "시스템 옵션은 관리자만 수정할 수 있습니다" }, { status: 403 });
    }

    // 커스텀 옵션은 본인 것만 수정 가능
    if (!existing.isSystem && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "본인의 옵션만 수정할 수 있습니다" }, { status: 403 });
    }

    const option = await prisma.styleOption.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        icon: icon || existing.icon,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        metadata: metadata !== undefined ? metadata : existing.metadata,
      },
    });

    return NextResponse.json({ success: true, option });
  } catch (error) {
    console.error("Style options PUT error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "수정 실패" },
      { status: 500 }
    );
  }
}

// DELETE: 스타일 옵션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id는 필수입니다" }, { status: 400 });
    }

    // 옵션 조회
    const existing = await prisma.styleOption.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "옵션을 찾을 수 없습니다" }, { status: 404 });
    }

    // 시스템 옵션은 관리자만 삭제 가능
    const userIsAdmin = isAdminByEmail(session.user.email) || isAdminByUserId(session.user.id);
    if (existing.isSystem && !userIsAdmin) {
      return NextResponse.json({ error: "시스템 옵션은 관리자만 삭제할 수 있습니다" }, { status: 403 });
    }

    // 커스텀 옵션은 본인 것만 삭제 가능
    if (!existing.isSystem && existing.userId !== session.user.id) {
      return NextResponse.json({ error: "본인의 옵션만 삭제할 수 있습니다" }, { status: 403 });
    }

    await prisma.styleOption.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Style options DELETE error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "삭제 실패" },
      { status: 500 }
    );
  }
}
