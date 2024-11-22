"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Signout() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute || !session) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/api/auth/signout" className="text-red-600 hover:text-red-800">
        Sign Out
      </Link>
    </div>
  );
}