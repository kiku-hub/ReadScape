import Link from "next/link";
import { auth } from "~/server/auth";
import Header from "./_components/Header";
import Container from "./_components/Container";

// 認証ボタンコンポーネント
function AuthButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-white mb-6 inline-block rounded-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] px-8 py-3 font-semibold shadow-md transition-all duration-300 hover:scale-105 hover:from-[#43a047] hover:to-[#81c784] focus:ring focus:ring-[#a5d6a7]"
    >
      {label}
    </Link>
  );
}

// タイトルコンポーネント
function Title() {
  return (
    <h1 className="text-gray-900 mb-6 text-5xl font-extrabold tracking-tighter sm:tracking-wide">
      <span className="text-[#4caf50] drop-shadow-lg">Read</span>{" "}
      <span className="text-[#2e7d32]">Scape</span>
    </h1>
  );
}

// サブタイトルコンポーネント
function Subtitle() {
  return (
    <p className="text-gray-700 mb-8 text-lg italic leading-relaxed sm:text-xl">
      Discover, organize, and master your technical knowledge effortlessly.
    </p>
  );
}

// イラストコンポーネント
function Illustration() {
  return (
    <div className="relative mx-auto h-48 w-3/4 sm:h-64 sm:w-full">
      <img
        src="/images/main-img.png"
        alt="Illustration"
        className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
      />
    </div>
  );
}

// 未ログイン画面
function UnauthenticatedView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9]">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl transition-transform duration-300 hover:scale-105 sm:p-10">
        {/* タイトル */}
        <Title />

        {/* サブタイトル */}
        <Subtitle />

        {/* 認証ボタン */}
        <AuthButton href="/api/auth/signin" label="Sign In" />

        {/* イラスト */}
        <Illustration />
      </div>
    </div>
  );
}

// ログイン後の画面
function AuthenticatedView() {
  return (
    <>
      <Header />
      <Container />
    </>
  );
}

// メインコンポーネント
export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#f1fdf5] to-[#e8f5e9]">
      {session ? <AuthenticatedView /> : <UnauthenticatedView />}
    </main>
  );
}
