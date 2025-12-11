import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

const HWASUBUN_API_URL = "https://hwasubun.ai/api/token2/user-tokens";

// 화수분 토큰 검증 함수
async function verifyHwasubunToken(token: string, pcSerial: string): Promise<{ success: boolean; data?: { userId?: string; email?: string; name?: string }; message?: string }> {
  try {
    const response = await fetch(HWASUBUN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, pcSerial }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success || data.valid) {
        return {
          success: true,
          data: {
            userId: data.userId || data.user?.id,
            email: data.email || data.user?.email,
            name: data.name || data.user?.name || data.username,
          },
          message: data.message
        };
      }
      return { success: false, message: data.message || "토큰 검증 실패" };
    }
    return { success: false, message: `서버 오류: ${response.status}` };
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    return { success: false, message: "토큰 검증 중 오류 발생" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "hwasubun-token",
      credentials: {
        token: { label: "Token", type: "text" },
        pcSerial: { label: "PC Serial", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token || !credentials?.pcSerial) {
          throw new Error("토큰과 PC 시리얼을 입력해주세요");
        }

        // 화수분 서버에서 토큰 검증
        const result = await verifyHwasubunToken(credentials.token, credentials.pcSerial);

        if (!result.success) {
          throw new Error(result.message || "토큰 인증 실패");
        }

        // 토큰 검증 성공 시 사용자 찾거나 생성
        const tokenUserId = result.data?.userId || credentials.token.substring(0, 20);
        const userEmail = result.data?.email || `${tokenUserId}@hwasubun.ai`;
        const userName = result.data?.name || "화수분 사용자";

        // 기존 사용자 찾기 (토큰 기반 ID로)
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userEmail },
              { id: tokenUserId },
            ]
          },
        });

        // 없으면 새로 생성
        if (!user) {
          user = await prisma.user.create({
            data: {
              id: tokenUserId,
              email: userEmail,
              password: "", // 토큰 인증이므로 비밀번호 없음
              name: userName,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
