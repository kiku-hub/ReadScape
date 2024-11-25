"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// 公開ルートの型定義
type PublicRoute = "/login" | "/signup";

// 公開ルートの定義
const PUBLIC_ROUTES: readonly PublicRoute[] = ["/login", "/signup"] as const;

// 型ガード関数
const isPublicRoute = (path: string): path is PublicRoute => {
  return PUBLIC_ROUTES.includes(path as PublicRoute);
};

// スタイリング定数
const LOGO_STYLES = {
  container: `fixed top-2 left-2 sm:top-4 sm:left-4 z-50`,
  link: `group`,
  heading: `
    text-gray-900 text-xl sm:text-2xl font-bold relative
    transition-all duration-300 ease-in-out
    hover:tracking-wide
    after:content-[''] after:absolute after:bottom-0 after:left-0 
    after:w-0 after:h-[2px] after:bg-[#4caf50] 
    after:transition-all after:duration-300
    after:blur-sm
    group-hover:after:w-full
    backdrop-blur-md
    shadow-[0_2px_8px_rgba(76,175,80,0.1)]
    hover:shadow-[0_4px_20px_rgba(76,175,80,0.15)]
    border border-transparent 
    hover:border-[rgba(76,175,80,0.2)]
    h-[32px] sm:h-[36px]
    flex items-center
    px-4 rounded-[20px]
    bg-white/30
    hover:bg-white/50
    before:absolute before:inset-0 
    before:rounded-[20px] 
    before:bg-gradient-to-r 
    before:from-[rgba(76,175,80,0.05)] 
    before:to-transparent 
    before:opacity-0
    hover:before:opacity-100
    before:transition-opacity
    before:duration-300
    overflow-hidden
  `,
  brandText: `
    text-[#4caf50] inline-block transform 
    group-hover:scale-105 transition-transform duration-300
    group-hover:text-[#43a047]
    relative z-10
  `,
  normalText: `
    inline-block transform 
    group-hover:scale-105 transition-transform duration-300
    relative z-10
  `,
} as const;

/**
 * ロゴコンポーネント
 * - 認証状態に応じて表示/非表示を切り替え
 * - ホームページへのリンクとして機能
 */
export default function Logo(): JSX.Element | null {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // パスが存在しない場合は非表示
  if (!pathname) return null;

  // 公開ルートまたは未認証の場合は非表示
  if (isPublicRoute(pathname) || !session) {
    return null;
  }

  return (
    <div className={LOGO_STYLES.container}>
      <Link href="/" className={LOGO_STYLES.link}>
        <h1 className={LOGO_STYLES.heading}>
          <span className={LOGO_STYLES.brandText}>Read</span>
          <span className={LOGO_STYLES.normalText}>&nbsp;Scape</span>
        </h1>
      </Link>
    </div>
  );
}