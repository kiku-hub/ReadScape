import Link from "next/link";
import { auth } from "~/server/auth";
import Header from "./_components/Header";
import Container from "./_components/Container";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col bg-[#f1fdf5]">
      {" "}
      {/* 背景色を調整 */}
      {session ? (
        <>
          {/* ログイン後の画面 */}
          <Header />
          <Container />
        </>
      ) : (
        // 未ログイン画面
        <div className="flex flex-grow items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-3xl p-10 text-center shadow-xl">
            <h1 className="text-gray-900 mb-6 text-5xl font-extrabold tracking-wide">
              <span className="text-[#4caf50]">Read</span> Scape
            </h1>
            <button className="text-white mb-6 rounded-full bg-[#4caf50] px-4 py-2 font-semibold shadow transition duration-300 hover:bg-[#43a047]">
              Sign Out
            </button>
            <p className="text-gray-600 mb-10 text-lg italic">
              - Technical Article Bookmarking & <br />
              Progress Management Tool -
            </p>
            <div className="relative mx-auto h-72 w-full">
              <img
                src="/images/main-img.png"
                alt="Illustration"
                className="rounded-xl shadow-lg transition hover:shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
