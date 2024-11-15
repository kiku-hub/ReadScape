import Link from "next/link";
import Image from "next/image"; // 画像を扱うために追加
import { auth } from "~/server/auth";
import Header from "./_components/Header";
import Container from "./_components/Container";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9]">
      <div className="bg-white w-full max-w-lg rounded-3xl p-10 text-center shadow-xl transition-transform duration-300 hover:scale-105">
        {/* タイトル */}
        <h1 className="text-gray-900 mb-6 text-5xl font-bold leading-tight tracking-tight">
          <span className="text-[#4caf50]">Read</span> Scape
        </h1>

        {/* 認証ボタン */}
        <div className="mb-8">
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="text-white inline-block rounded-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] px-8 py-3 text-lg font-semibold shadow-md transition-all duration-300 hover:from-[#43a047] hover:to-[#81c784] hover:shadow-lg"
          >
            {session ? "Sign Out" : "Get Started with Google Login"}
          </Link>
        </div>

        {/* サブタイトル */}
        <p className="text-gray-600 mb-10 text-lg italic leading-relaxed">
          - Technical Article Bookmarking & <br />
          Progress Management Tool -
        </p>

        {/* イラスト */}
        <div className="relative mx-auto h-72 w-full">
          <Image
            src="/images/main-img.png"
            alt="Workspace illustration"
            layout="fill"
            objectFit="contain"
            className="rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl"
          />
        </div>
      </div>
    </main>
  );
}
