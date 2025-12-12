import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// MIME 타입 매핑
const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;

    // 경로 조합
    const filePath = path.join(process.cwd(), "public", "uploads", ...pathSegments);

    // 보안: public/uploads 외부 접근 방지
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    // 파일 존재 확인
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 파일 읽기
    const file = await readFile(filePath);

    // 확장자로 MIME 타입 결정
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
