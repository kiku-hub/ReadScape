"use client";

import { useSession } from "next-auth/react"; // next-authからセッションを取得
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import Signout from "./Signout";

export default function NavBar() {
  const { data: session } = useSession(); // ログイン状態を取得
  const pathname = usePathname(); // 現在のパスを取得
  const publicRoutes = ["/login", "/signup"]; // 未ログインページのパス
  const isPublicRoute = publicRoutes.includes(pathname);

  // 未ログインページ、またはログインしていない場合はNavBarを非表示
  if (isPublicRoute || !session) {
    return null;
  }

  return (
    <nav className="bg-gray-800 text-white flex items-center justify-between px-4 py-2">
      <Logo />
      <Signout />
    </nav>
  );
}
