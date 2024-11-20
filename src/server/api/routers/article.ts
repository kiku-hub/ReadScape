import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const articleDetailsSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  url: z.string().url("有効なURLを入力してください"),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
});

const urlInputSchema = z.object({
  url: z.string().url({ message: "有効なURLを入力してください" }),
});

const saveArticleSchema = z.object({
  url: z.string().url(),
  status: z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED", "ALL"]),
  memo: z.string().optional(),
});

export type ArticleDetails = z.infer<typeof articleDetailsSchema>;

export const articleRouter = createTRPCRouter({
  getArticleDetails: publicProcedure
    .input(urlInputSchema)
    .output(articleDetailsSchema)
    .mutation(async ({ input }): Promise<ArticleDetails> => {
      try {
        const validatedUrl = urlInputSchema.parse(input);

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

        await response.text();

        const articleData = {
          title: "記事タイトル",
          url: validatedUrl.url,
          thumbnail: null,
          description: null,
        };

        const validatedArticle = articleDetailsSchema.parse(articleData);

        return validatedArticle;
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "データの形式が不正です",
            cause: error.message,
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          console.error("Unexpected error:", error.message);
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事情報の取得に失敗しました",
        });
      }
    }),

  save: protectedProcedure
    .input(saveArticleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const article = await ctx.db.article.create({
          data: {
            url: input.url,
            status: input.status,
            memo: input.memo,
            userId: ctx.session.user.id,
          },
        });
        return article;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Save error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の保存に失敗しました",
        });
      }
    }),

  getArticlesByStatus: protectedProcedure
    .input(z.object({
      status: z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED", "ALL"])
    }))
    .query(async ({ ctx, input }) => {
      try {
        const where = {
          userId: ctx.session.user.id,
          ...(input.status !== "ALL" ? { status: input.status } : {}),
        };

        const articles = await ctx.db.article.findMany({
          where,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            url: true,
            status: true,
            memo: true,
            createdAt: true,
          }
        });
        return articles;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Fetch error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の取得に失敗しました",
        });
      }
    }),
});