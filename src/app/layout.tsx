import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react"; // セッションプロバイダーをインポート
import { TRPCReactProvider } from "~/trpc/react";
import NavBar from "./_components/NavBar";

export const metadata: Metadata = {
  title: "Read Scape",
  description: "coming soon",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <SessionProvider>
          {" "}
          {/* ここでセッションプロバイダーを追加 */}
          <TRPCReactProvider>
            <NavBar />
            {children}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
