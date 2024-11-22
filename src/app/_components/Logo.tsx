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
    <div className="fixed top-2 left-2 sm:top-4 sm:left-4 z-50">
      <Link href="/" className="group">
        <h1 
          className="text-gray-900 text-xl sm:text-2xl font-bold relative
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
            overflow-hidden"
        >
          <span className="text-[#4caf50] inline-block transform 
            group-hover:scale-105 transition-transform duration-300
            group-hover:text-[#43a047]
            relative z-10"
          >
            Read
          </span>
          <span className="inline-block transform 
            group-hover:scale-105 transition-transform duration-300
            relative z-10"
          >
            &nbsp;Scape
          </span>
        </h1>
      </Link>
    </div>
  );
}