"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Logo() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute || !session) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/">
        <h1 className="text-gray-900 text-2xl font-bold">
          <span className="text-[#4caf50]">Read</span> Scape
        </h1>
      </Link>
    </div>
  );
}