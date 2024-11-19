"use client";

import { useSession } from "next-auth/react";
import AuthenticatedView from "./_components/AuthenticatedView";
import UnauthenticatedView from "./_components/UnauthenticatedView";

export default function Home() {
  const { data: session, status } = useSession();

  // セッションのローディング中
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-blue-500 h-12 w-12 animate-spin rounded-full border-t-4"></div>
      </div>
    );
  }

  // 認証状態に応じてビューを切り替え
  return session ? <AuthenticatedView /> : <UnauthenticatedView />;
}
