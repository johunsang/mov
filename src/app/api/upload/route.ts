import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP만 지원)" },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기가 10MB를 초과합니다." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 사용자별 디렉토리 생성
    const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 고유한 파일명 생성 (한글, 숫자, 영문 허용)
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    // 한글, 영문, 숫자, 하이픈, 언더스코어만 허용 (그 외 문자는 제거)
    const sanitizedName = baseName.replace(/[^\uAC00-\uD7A3a-zA-Z0-9\-_]/g, '').substring(0, 50);
    const filename = `${Date.now()}-${sanitizedName || 'file'}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // 공개 URL 반환 (public 폴더에서 직접 서빙)
    const url = `/uploads/${session.user.id}/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return NextResponse.json(
      { error: "파일 업로드에 실패했습니다." },
      { status: 500 }
    );
  }
}
