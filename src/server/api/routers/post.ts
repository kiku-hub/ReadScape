import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// 入力スキーマの定義を集中管理
const postSchemas = {
  hello: z.object({ text: z.string() }),
  create: z.object({ name: z.string().min(1) }),
} as const;

// クエリオプションの定義を集中管理
const queryOptions = {
  latest: {
    orderBy: { createdAt: "desc" } as const,
  },
} as const;

/**
 * 投稿関連のルーターを管理するクラス
 * すべての投稿関連のエンドポイントをここで定義
 */
export const postRouter = createTRPCRouter({
  // 公開エンドポイント
  hello: publicProcedure
    .input(postSchemas.hello)
    .query(({ input }) => ({
      greeting: `Hello ${input.text}`,
    })),

  // 保護されたエンドポイント群
  create: protectedProcedure
    .input(postSchemas.create)
    .mutation(async ({ ctx, input }) => {
      // トランザクションを使用してデータの整合性を保証
      return ctx.db.$transaction(async (tx) => {
        return tx.post.create({
          data: {
            name: input.name,
            createdBy: { 
              connect: { id: ctx.session.user.id } 
            },
          },
          // 必要なフィールドのみを選択してパフォーマンスを最適化
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        });
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      where: { 
        createdBy: { id: ctx.session.user.id } 
      },
      ...queryOptions.latest,
      // 必要なフィールドのみを選択
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});