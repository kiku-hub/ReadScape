"use client";

import { useSession } from "next-auth/react";
import AuthenticatedView from "./_components/AuthenticatedView";
import UnauthenticatedView from "./_components/UnauthenticatedView";

// ローディングインジケーターのサイズを定数化
const LOADING_SPINNER_SIZE = {
  height: 12,
  width: 12,
} as const;

// ローディングインジケーターコンポーネント
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div
      className="border-blue-500 animate-spin rounded-full border-t-4"
      style={{
        height: `${LOADING_SPINNER_SIZE.height}px`,
        width: `${LOADING_SPINNER_SIZE.width}px`,
      }}
    />
  </div>
);

/**
 * ホームページコンポーネント
 * 認証状態に応じて適切なビューを表示する
 */
export default function HomePage(): JSX.Element {
  // セッション状態の取得
  const { data: session, status } = useSession();

  // セッションのローディング中はローディングインジケーターを表示
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // 認証状態に応じてビューを切り替え
  return session ? <AuthenticatedView /> : <UnauthenticatedView />;
}