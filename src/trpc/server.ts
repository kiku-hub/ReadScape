import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";
import { createCaller, type AppRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { createQueryClient } from "./query-client";

// tRPCのコンテキスト作成時に使用するヘッダー設定
const TRPC_SOURCE_HEADER = "x-trpc-source";
const RSC_SOURCE_VALUE = "rsc";

// サーバーコンテキストのヘッダー型定義
interface ServerContextHeaders {
  headers: Headers;
}

/**
 * React Server Componentで使用するtRPCコンテキストを作成します
 * このコンテキストはサーバーサイドでのみ使用され、APIコールのための設定を提供します
 * @returns Promise<TRPCContext> - tRPCコンテキスト
 */
const createServerContext = cache(async () => {
  const requestHeaders = new Headers(await headers());
  requestHeaders.set(TRPC_SOURCE_HEADER, RSC_SOURCE_VALUE);

  const contextHeaders: ServerContextHeaders = {
    headers: requestHeaders
  };

  return createTRPCContext(contextHeaders);
});

/**
 * React Queryのクライアントインスタンスを作成し、キャッシュします
 */
const getCachedQueryClient = cache(createQueryClient);

/**
 * tRPC callerインスタンスを作成
 * これによりサーバーコンポーネントからtRPC APIを直接呼び出すことが可能になります
 */
const serverCaller = createCaller(createServerContext);

/**
 * クライアントサイドでのハイドレーションを管理するためのヘルパー関数と
 * サーバーサイドでのAPI呼び出しを行うためのtrpcクライアントをエクスポート
 */
export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  serverCaller,
  getCachedQueryClient
);