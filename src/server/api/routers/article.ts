import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// ArticleDetailsのZodスキーマを定義
export const articleDetailsSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
});

// 入力のバリデーションスキーマ
const urlInputSchema = z.object({
  url: z.string().url({ message: "有効なURLを入力してください" }),
});

// 型を導出してエクスポート
export type ArticleDetails = z.infer<typeof articleDetailsSchema>;

export const articleRouter = createTRPCRouter({
  getArticleDetails: publicProcedure
    .input(urlInputSchema)
    .output(articleDetailsSchema)
    .mutation(async ({ input }): Promise<ArticleDetails> => {
      try {
        // URLの検証
        const validatedUrl = urlInputSchema.parse(input);

        // フェッチ処理
        const response = await fetch(validatedUrl.url, {
          method: "GET",
          headers: {
            Accept: "text/html",
          },
        });

        if (!response.ok) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `URLにアクセスできません: ${response.status} ${response.statusText}`,
          });
        }

        // TODO: OGPの解析処理を実装する
        await response.text();

        // 仮のレスポンスデータを作成
        const articleData = {
          title: "記事タイトル",
          url: validatedUrl.url,
          thumbnail: null,
          description: null,
        };

        // レスポンスデータの検証
        const validatedArticle = articleDetailsSchema.parse(articleData);

        return validatedArticle;
      } catch (error) {
        // エラーハンドリングの改善
        if (error instanceof z.ZodError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "データの形式が不正です",
            cause: error,
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        // 未知のエラーの場合
        console.error("Unexpected error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事情報の取得に失敗しました",
          cause: error,
        });
      }
    }),
});