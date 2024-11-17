import Link from "next/link"; // Linkをインポート
import Image from "next/image"; // next/imageをインポート
import { auth } from "~/server/auth";
import UrlInput from "./_components/UrlInput"; // UrlInputをインポート

// 未ログイン画面
function UnauthenticatedView() {
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
            width={200} // 適切な幅
            height={200} // 適切な高さ
            className="rounded-lg object-contain transition-transform duration-700 hover:rotate-6 hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
}

// ログイン後画面
function AuthenticatedView() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#e6ffe9] to-[#c7f4d6]">
      {/* URL入力コンポーネントを上部に配置 */}
      <div className="bg-white mt-10 w-full max-w-lg rounded-3xl p-6 shadow-2xl">
        <UrlInput />
      </div>
    </div>
  );
}

// メインコンポーネント
export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-[#eefaf2] to-[#d7ebdb]">
      {/* ログイン状態に応じて表示を切り替え */}
      {session ? <AuthenticatedView /> : <UnauthenticatedView />}
    </main>
  );
}
