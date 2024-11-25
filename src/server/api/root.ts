import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { postRouter } from "~/server/api/routers/post";
import { articleRouter } from "~/server/api/routers/article";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * ルーター定義の型
 * 各ルーターの入力と出力の型を推論するために使用
 */
type RouterDefinition = {
  post: typeof postRouter;
  article: typeof articleRouter;
};

/**
 * メインのアプリケーションルーター
 * すべてのサブルーターをここで統合管理
 * 
 * @remarks
 * - 新しいルーターを追加する場合は、RouterDefinition型と
 *   createMainRouter関数の両方に追加する必要があります
 * - 各ルーターは独立して管理され、単一責任の原則に従う
 */
const createMainRouter = () => {
  return createTRPCRouter<RouterDefinition>({
    post: postRouter,
    article: articleRouter,
  });
};

// メインルーターのインスタンスを作成
export const appRouter = createMainRouter();

// APIの型定義をエクスポート
export type AppRouter = typeof appRouter;

// 入力型の推論
export type RouterInputs = inferRouterInputs<AppRouter>;

// 出力型の推論
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * サーバーサイドでのAPI呼び出し用のcallerを作成
 * 
 * @example
 * ```typescript
 * const trpc = createCaller(createContext);
 * const posts = await trpc.post.all();
 * //    ^? Post[]
 * ```
 */
export const createCaller = createCallerFactory(appRouter);