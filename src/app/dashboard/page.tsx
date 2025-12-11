"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image, Video, Wand2, Film, ArrowRight, Key } from "lucide-react";

export default function DashboardPage() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/user/apikey")
      .then((res) => res.json())
      .then((data) => setHasApiKey(data.hasKey));
  }, []);

  const features = [
    {
      href: "/dashboard/workflow",
      icon: Wand2,
      title: "워크플로우",
      description: "스크립트 → 이미지 → 영상 자동화",
      color: "from-purple-600 to-pink-600",
    },
    {
      href: "/dashboard/image",
      icon: Image,
      title: "이미지 생성",
      description: "AI로 고품질 이미지 생성",
      color: "from-blue-600 to-cyan-600",
    },
    {
      href: "/dashboard/video",
      icon: Video,
      title: "영상 생성",
      description: "텍스트로 영상 제작",
      color: "from-green-600 to-emerald-600",
    },
    {
      href: "/dashboard/image-to-video",
      icon: Film,
      title: "이미지→영상",
      description: "이미지를 영상으로 변환",
      color: "from-orange-600 to-yellow-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">대시보드</h1>
        <p className="text-zinc-400">AI 기반 이미지 및 영상 생성 도구</p>
      </div>

      {hasApiKey === false && (
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-4 p-4 mb-8 bg-yellow-900/30 border border-yellow-700 rounded-xl hover:bg-yellow-900/40 transition-colors"
        >
          <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
            <Key className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-300">API 키 설정 필요</h3>
            <p className="text-sm text-yellow-400/80">
              Replicate API 키를 설정해야 생성 기능을 사용할 수 있습니다
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-yellow-400" />
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all"
          >
            <div
              className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {feature.title}
            </h2>
            <p className="text-zinc-400">{feature.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
