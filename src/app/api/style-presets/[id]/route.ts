import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: 특정 스타일 프리셋 조회
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const preset = await prisma.stylePreset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!preset) {
      return NextResponse.json(
        { error: "프리셋을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Failed to fetch style preset:", error);
    return NextResponse.json(
      { error: "프리셋을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 스타일 프리셋 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 본인 프리셋인지 확인
    const existingPreset = await prisma.stylePreset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPreset) {
      return NextResponse.json(
        { error: "프리셋을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const preset = await prisma.stylePreset.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        genre: body.genre,
        customGenre: body.customGenre,
        mood: body.mood,
        customMood: body.customMood,
        visualStyle: body.visualStyle,
        lightingStyle: body.lightingStyle,
        cameraAngle: body.cameraAngle,
        shotSize: body.shotSize,
        cameraMovement: body.cameraMovement,
        pacing: body.pacing,
        transitionStyle: body.transitionStyle,
        colorGrade: body.colorGrade,
        timeSetting: body.timeSetting,
        weatherSetting: body.weatherSetting,
        format: body.format,
        duration: body.duration,
        characterIds: body.characterIds,
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Failed to update style preset:", error);
    return NextResponse.json(
      { error: "프리셋 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 스타일 프리셋 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 본인 프리셋인지 확인
    const existingPreset = await prisma.stylePreset.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPreset) {
      return NextResponse.json(
        { error: "프리셋을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await prisma.stylePreset.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete style preset:", error);
    return NextResponse.json(
      { error: "프리셋 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
