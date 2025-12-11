import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - 캐릭터 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const characters = await prisma.character.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(characters);
  } catch (error) {
    console.error("Failed to fetch characters:", error);
    return NextResponse.json(
      { error: "캐릭터 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST - 새 캐릭터 생성
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
      role,
      gender,
      age,
      appearance,
      clothing,
      personality,
      referenceImages,
      generatedImages,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "캐릭터 이름은 필수입니다." },
        { status: 400 }
      );
    }

    const character = await prisma.character.create({
      data: {
        name,
        description,
        role,
        gender,
        age,
        appearance,
        clothing,
        personality,
        referenceImages,
        generatedImages,
        userId: session.user.id,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Failed to create character:", error);
    return NextResponse.json(
      { error: "캐릭터 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
