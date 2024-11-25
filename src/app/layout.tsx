import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import Logo from "~/app/_components/Logo";
import Signout from "~/app/_components/Signout";
import SearchModal from "~/app/_components/SearchModal";

// メタデータの定数化
const APP_METADATA: Metadata = {
  title: "Read Scape",
  description: "coming soon",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const metadata = APP_METADATA;

// レイアウトのプロパティの型定義
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * アプリケーションのルートレイアウトコンポーネント
 * 共通のプロバイダーとレイアウト要素を提供する
 * @param {RootLayoutProps} props - レイアウトのプロパティ
 * @returns {JSX.Element} レイアウトコンポーネント
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={`${GeistSans.variable} bg-white`}>
      <body className="min-h-screen bg-white">
        {/* 認証状態の管理 */}
        <SessionProvider>
          {/* APIクライアントの提供 */}
          <TRPCReactProvider>
            {/* ヘッダーコンポーネント群 */}
            <header>
              <Logo />
              <SearchModal />
              <Signout />
            </header>
            
            {/* メインコンテンツ */}
            <main className="bg-white">
              {children}
            </main>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}