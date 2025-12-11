import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: 사용자의 스타일 프리셋 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const presets = await prisma.stylePreset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(presets);
  } catch (error) {
    console.error("Failed to fetch style presets:", error);
    return NextResponse.json(
      { error: "프리셋 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 새 스타일 프리셋 저장
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      icon,
      genre,
      customGenre,
      mood,
      customMood,
      visualStyle,
      lightingStyle,
      cameraAngle,
      shotSize,
      cameraMovement,
      pacing,
      transitionStyle,
      colorGrade,
      timeSetting,
      weatherSetting,
      format,
      duration,
      characterIds,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "프리셋 이름은 필수입니다." },
        { status: 400 }
      );
    }

    const preset = await prisma.stylePreset.create({
      data: {
        name,
        description,
        icon: icon || "🎬",
        genre,
        customGenre,
        mood,
        customMood,
        visualStyle,
        lightingStyle,
        cameraAngle,
        shotSize,
        cameraMovement,
        pacing,
        transitionStyle,
        colorGrade,
        timeSetting,
        weatherSetting,
        format,
        duration,
        characterIds,
        userId: session.user.id,
      },
    });

    return NextResponse.json(preset);
  } catch (error) {
    console.error("Failed to create style preset:", error);
    return NextResponse.json(
      { error: "프리셋 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
