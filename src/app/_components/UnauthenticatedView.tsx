import Link from "next/link";
import Image from "next/image";

export default function UnauthenticatedView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f3f8f4] to-[#d4e7d6]">
      <div className="bg-white w-full max-w-lg rounded-3xl p-10 text-center shadow-2xl">
        {/* タイトル */}
        <h1 className="mb-6 text-6xl font-extrabold leading-tight tracking-tight text-[#43a047] hover:animate-pulse">
          Read<span className="text-[#66bb6a]">Scape</span>
        </h1>

        {/* サブタイトル */}
        <p className="text-gray-700 mb-10 text-lg italic leading-relaxed transition-all duration-300 hover:scale-105 hover:text-[#388e3c]">
          - Bookmark & Progress Management Tool for Tech Learners -
        </p>

        {/* ボタン */}
        <div className="mb-8">
          <Link
            href="/api/auth/signin"
            className="text-white focus:ring-green-300 relative inline-block overflow-hidden rounded-full bg-gradient-to-r from-[#66bb6a] to-[#43a047] px-12 py-4 text-lg font-bold shadow-lg transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-4 active:scale-95"
          >
            <span className="bg-white absolute inset-0 opacity-20 blur-xl"></span>
            Get Started with Google Login
          </Link>
        </div>

        {/* イラスト */}
        <div className="relative mx-auto mt-10 flex max-w-xs items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#f9fbf8] to-[#eaf3e8] shadow-2xl transition-transform duration-500 hover:scale-105">
          <Image
            src="/images/main-img.png"
            alt="Workspace illustration"
            width={200}
            height={200}
            className="rounded-lg object-contain transition-transform duration-700 hover:rotate-6 hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}
