"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";
import { createQueryClient } from "./query-client";

// 定数の集中管理
const CONSTANTS = {
  DEFAULT_PORT: 3000,
  TRPC_SOURCE: "nextjs-react",
  TRPC_ENDPOINT: "/api/trpc",
} as const;

// シングルトンパターンの実装をより明確に
class QueryClientSingleton {
  private static instance: QueryClient | undefined;

  static getInstance(): QueryClient {
    if (typeof window === "undefined") {
      return createQueryClient(); // サーバーサイドでは新しいインスタンスを作成
    }
    
    if (!this.instance) {
      this.instance = createQueryClient();
    }
    
    return this.instance;
  }
}

// tRPCクライアントの作成
export const api = createTRPCReact<AppRouter>();

/**
 * 入力の型推論ヘルパー
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * 出力の型推論ヘルパー
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * ベースURLを取得するユーティリティ関数
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? CONSTANTS.DEFAULT_PORT}`;
}

/**
 * tRPCクライアントの設定を生成する関数
 */
function createTRPCClientConfig() {
  return {
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      unstable_httpBatchStreamLink({
        transformer: SuperJSON,
        url: `${getBaseUrl()}${CONSTANTS.TRPC_ENDPOINT}`,
        headers: () => {
          const headers = new Headers();
          headers.set("x-trpc-source", CONSTANTS.TRPC_SOURCE);
          return headers;
        },
      }),
    ],
  };
}

interface TRPCReactProviderProps {
  children: React.ReactNode;
}

/**
 * tRPCプロバイダーコンポーネント
 * アプリケーション全体でtRPCクライアントを提供
 */
export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
  const queryClient = QueryClientSingleton.getInstance();
  const [trpcClient] = useState(() => api.createClient(createTRPCClientConfig()));

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}