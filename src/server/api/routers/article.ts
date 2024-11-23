import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import * as cheerio from 'cheerio';

// ArticleStatus の型定義
export const articleStatusSchema = z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

// StatusType の定義（ALL を含む）
export const statusTypeSchema = z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED", "ALL"]);
export type StatusType = z.infer<typeof statusTypeSchema>;

// メタデータ抽出関数を追加
function extractMetadata(html: string) {
  const $ = cheerio.load(html);
  
  const getMetaContent = (name: string): string | null => {
    return $(`meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`).attr('content') ?? null;
  };

  return {
    title: $('title').text() || getMetaContent('title'),
    description: getMetaContent('description'),
    image: getMetaContent('image'),
  };
}

// 検索結果の型定義を修正
const articleSearchResultSchema = z.object({
  id: z.string(),
  url: z.string(),
  status: articleStatusSchema,
  memo: z.string().nullable(),
  createdAt: z.date(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  image: z.string().nullable(),
});

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
  status: articleStatusSchema,
  memo: z.string().optional(),
});

const updateArticleSchema = z.object({
  id: z.string(),
  memo: z.string(),
  status: articleStatusSchema,
});

export type ArticleDetails = z.infer<typeof articleDetailsSchema>;

export const articleRouter = createTRPCRouter({
  getArticlesByStatus: protectedProcedure
    .input(
      z.object({
        status: statusTypeSchema,
      })
    )
    .output(z.array(articleSearchResultSchema))
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ログインが必要です",
        });
      }

      try {
        const where = {
          userId: ctx.session.user.id,
          ...(input.status && input.status !== "ALL" ? { status: input.status } : {}),
        };

        const articles = await ctx.db.article.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
        });

        return articles.map(article => ({
          id: article.id,
          url: article.url,
          status: article.status as ArticleStatus,
          memo: article.memo,
          createdAt: article.createdAt,
          title: article.title,
          description: article.description,
          image: article.image,
        }));
      } catch (error) {
        console.error("GetArticlesByStatus error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の取得に失敗しました",
        });
      }
    }),

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

        const html = await response.text();
        const metadata = extractMetadata(html);

        return {
          title: metadata.title ?? "",
          url: validatedUrl.url,
          thumbnail: metadata.image,
          description: metadata.description,
        };
      } catch (error) {
        if (error instanceof Error) {
          console.error("GetArticleDetails error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の詳細取得に失敗しました",
        });
      }
    }),

  save: protectedProcedure
    .input(saveArticleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // 直接URLからメタデータを取得
        const response = await fetch(input.url, {
          method: "GET",
          headers: {
            Accept: "text/html",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const metadata = extractMetadata(html);

        const article = await ctx.db.article.create({
          data: {
            url: input.url,
            status: input.status,
            memo: input.memo ?? "",
            userId: ctx.session.user.id,
            title: metadata.title ?? null,
            description: metadata.description ?? null,
            image: metadata.image ?? null,
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

  searchArticles: protectedProcedure
    .input(z.object({ query: z.string() }))
    .output(z.array(articleSearchResultSchema))
    .query(async ({ ctx, input }) => {
      try {
        const articles = await ctx.db.article.findMany({
          where: {
            userId: ctx.session.user.id,
            OR: [
              { url: { contains: input.query, mode: 'insensitive' } },
              { memo: { contains: input.query, mode: 'insensitive' } },
              { title: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return articles.map(article => ({
          id: article.id,
          url: article.url,
          status: article.status as ArticleStatus,
          memo: article.memo,
          createdAt: article.createdAt,
          title: article.title,
          description: article.description,
          image: article.image,
        }));
      } catch (error) {
        if (error instanceof Error) {
          console.error("Search error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の検索に失敗しました",
        });
      }
    }),

  update: protectedProcedure
    .input(updateArticleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const article = await ctx.db.article.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            memo: input.memo,
            status: input.status,
          },
        });
        return article;
      } catch (error) {
        if (error instanceof Error) {
          console.error("Update error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の更新に失敗しました",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.article.delete({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          console.error("Delete error:", error.message);
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "記事の削除に失敗しました",
        });
      }
    }),
});