import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import Logo from "~/app/_components/Logo";
import Signout from "~/app/_components/Signout";

export const metadata: Metadata = {
  title: "Read Scape",
  description: "coming soon",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} bg-white`}>
      <body className="bg-white min-h-screen">
        <SessionProvider>
          <TRPCReactProvider>
            <Logo />
            <Signout />
            <main className="bg-white">{children}</main>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}