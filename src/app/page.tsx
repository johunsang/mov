import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Film, Image, Video, Wand2, ArrowRight } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">화수분 영상 생성기</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            AI로 만드는
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              이미지와 영상
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            텍스트만으로 고품질 이미지와 영상을 생성하세요.
            <br />
            스크립트 → 이미지 → 영상 자동 워크플로우를 지원합니다.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-medium text-lg flex items-center gap-2 transition-all"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Wand2,
                title: "자동 워크플로우",
                description: "주제만 입력하면 스크립트, 이미지, 영상이 자동 생성됩니다",
                color: "from-purple-600 to-pink-600",
              },
              {
                icon: Image,
                title: "이미지 생성",
                description: "Nano Banana Pro로 고품질 이미지를 생성합니다",
                color: "from-blue-600 to-cyan-600",
              },
              {
                icon: Video,
                title: "영상 생성",
                description: "Veo 3.1, Kling v2.5로 텍스트 기반 영상을 만듭니다",
                color: "from-green-600 to-emerald-600",
              },
              {
                icon: Film,
                title: "이미지→영상",
                description: "정지 이미지를 움직이는 영상으로 변환합니다",
                color: "from-orange-600 to-yellow-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">지원 AI 모델</h2>
          <p className="text-zinc-400 text-center mb-12">최신 AI 모델들을 모두 지원합니다</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Google Veo 3.1",
              "Kling v2.5",
              "Nano Banana Pro",
              "Gemini 2.5 Flash",
              "GPT-5",
              "Claude 4.5 Sonnet",
            ].map((model) => (
              <div
                key={model}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 text-sm"
              >
                {model}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">지금 시작하세요</h2>
          <p className="text-zinc-400 mb-8">
            Replicate API 키만 있으면 바로 사용할 수 있습니다
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-medium text-lg items-center gap-2 transition-all"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-zinc-400">화수분 영상 생성기</span>
          </div>
          <p className="text-sm text-zinc-500">Powered by Replicate</p>
        </div>
      </footer>
    </div>
  );
}
