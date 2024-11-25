import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

// 定数の集中管理
const CONSTANTS = {
  DEV_MIN_DELAY_MS: 100,
  DEV_MAX_DELAY_MS: 400,
} as const;

// コンテキストの型定義
type CreateContextOptions = {
  headers: Headers;
};

/**
 * tRPCコンテキストの作成
 * データベースとセッション情報を含むコンテキストを生成
 */
export const createTRPCContext = async (opts: CreateContextOptions) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

// tRPCの初期化と基本設定
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * サーバーサイドコーラーの作成
 * サーバー内部でのプロシージャ呼び出しに使用
 */
export const createCallerFactory = t.createCallerFactory;

// ルーター作成用のヘルパー関数
export const createTRPCRouter = t.router;

/**
 * 実行時間計測ミドルウェア
 * 開発環境では人工的な遅延を追加してネットワークレイテンシをシミュレート
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(
      Math.random() * CONSTANTS.DEV_MAX_DELAY_MS
    ) + CONSTANTS.DEV_MIN_DELAY_MS;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();
  const executionTime = Date.now() - start;
  
  console.log(`[TRPC] ${path} took ${executionTime}ms to execute`);
  return result;
});

/**
 * 認証チェックミドルウェア
 * セッションとユーザー情報の存在を確認
 */
const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * 公開プロシージャ
 * 認証不要のエンドポイント用
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * 保護されたプロシージャ
 * 認証必須のエンドポイント用
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(authMiddleware);