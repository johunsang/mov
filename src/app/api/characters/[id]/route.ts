import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - 개별 캐릭터 조회
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
    const character = await prisma.character.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!character) {
      return NextResponse.json(
        { error: "캐릭터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error("Failed to fetch character:", error);
    return NextResponse.json(
      { error: "캐릭터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT - 캐릭터 수정
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

    // 캐릭터가 현재 사용자의 것인지 확인
    const existing = await prisma.character.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "캐릭터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const character = await prisma.character.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        role: body.role,
        gender: body.gender,
        age: body.age,
        appearance: body.appearance,
        clothing: body.clothing,
        personality: body.personality,
        referenceImages: body.referenceImages,
        generatedImages: body.generatedImages,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error("Failed to update character:", error);
    return NextResponse.json(
      { error: "캐릭터 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE - 캐릭터 삭제
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

    // 캐릭터가 현재 사용자의 것인지 확인
    const existing = await prisma.character.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "캐릭터를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await prisma.character.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete character:", error);
    return NextResponse.json(
      { error: "캐릭터 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
