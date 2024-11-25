import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import * as cheerio from 'cheerio';

// ============= Constants =============
const ERROR_MESSAGES = {
  UNAUTHORIZED: "ログインが必要です",
  FETCH_FAILED: "記事の取得に失敗しました",
  DETAILS_FAILED: "記事の詳細取得に失敗しました",
  SAVE_FAILED: "記事の保存に失敗しました",
  SEARCH_FAILED: "記事の検索に失敗しました",
  UPDATE_FAILED: "記事の更新に失敗しました",
  DELETE_FAILED: "記事の削除に失敗しました",
} as const;

// ============= Type Definitions =============
/**
 * 記事のステータスを定義
 * @description 記事の読書状態を表す列挙型
 */
export const articleStatusSchema = z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED"]);
export type ArticleStatus = z.infer<typeof articleStatusSchema>;

/**
 * フィルタリング用のステータスタイプ
 * @description 記事一覧の表示フィルター用（ALLを含む）
 */
export const statusTypeSchema = z.enum(["WANT_TO_READ", "IN_PROGRESS", "COMPLETED", "ALL"]);
export type StatusType = z.infer<typeof statusTypeSchema>;

// ============= Schema Definitions =============
const schemaDefinitions = {
  articleSearch: z.object({
    id: z.string(),
    url: z.string(),
    status: articleStatusSchema,
    memo: z.string().nullable(),
    createdAt: z.date(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    image: z.string().nullable(),
  }),

  articleDetails: z.object({
    title: z.string().min(1, "タイトルは必須です"),
    url: z.string().url("有効なURLを入力してください"),
    thumbnail: z.string().nullable(),
    description: z.string().nullable(),
  }),

  input: {
    url: z.object({
      url: z.string().url({ message: "有効なURLを入力してください" }),
    }),
    save: z.object({
      url: z.string().url(),
      status: articleStatusSchema,
      memo: z.string().optional(),
    }),
    update: z.object({
      id: z.string(),
      memo: z.string(),
      status: articleStatusSchema,
    }),
    delete: z.object({ id: z.string() }),
    search: z.object({ query: z.string() }),
  },
};

export type ArticleDetails = z.infer<typeof schemaDefinitions.articleDetails>;

// ============= Utility Functions =============
/**
 * メタデータ抽出のためのユーティリティクラス
 */
class MetadataExtractor {
  /**
   * HTMLからメタデータを抽出
   */
  static extract(html: string) {
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

  /**
   * URLからメタデータを取得
   */
  static async fetchFromUrl(url: string) {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "text/html" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return this.extract(html);
  }
}

/**
 * エラーハンドリングユーティリティ
 */
class ErrorHandler {
  static handle(error: unknown, message: string): never {
    if (error instanceof Error) {
      console.error(`${message}:`, error.message);
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message,
    });
  }
}

// ============= Router Definition =============
export const articleRouter = createTRPCRouter({
  getArticlesByStatus: protectedProcedure
    .input(z.object({ status: statusTypeSchema }))
    .output(z.array(schemaDefinitions.articleSearch))
    .query(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: ERROR_MESSAGES.UNAUTHORIZED });
      }

      try {
        const where = {
          userId: ctx.session.user.id,
          ...(input.status !== "ALL" ? { status: input.status } : {}),
        };

        const articles = await ctx.db.article.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return articles.map(article => ({
          ...article,
          status: article.status as ArticleStatus,
        }));
      } catch (error) {
        ErrorHandler.handle(error, ERROR_MESSAGES.FETCH_FAILED);
      }
    }),

  getArticleDetails: publicProcedure
    .input(schemaDefinitions.input.url)
    .output(schemaDefinitions.articleDetails)
    .mutation(async ({ input }) => {
      try {
        const metadata = await MetadataExtractor.fetchFromUrl(input.url);
        
        return {
          title: metadata.title ?? "",
          url: input.url,
          thumbnail: metadata.image,
          description: metadata.description,
        };
      } catch (error) {
        ErrorHandler.handle(error, ERROR_MESSAGES.DETAILS_FAILED);
      }
    }),

  save: protectedProcedure
    .input(schemaDefinitions.input.save)
    .mutation(async ({ ctx, input }) => {
      try {
        const metadata = await MetadataExtractor.fetchFromUrl(input.url);

        return await ctx.db.article.create({
          data: {
            url: input.url,
            status: input.status,
            memo: input.memo ?? "",
            userId: ctx.session.user.id,
            title: metadata.title,
            description: metadata.description,
            image: metadata.image,
          },
        });
      } catch (error) {
        ErrorHandler.handle(error, ERROR_MESSAGES.SAVE_FAILED);
      }
    }),

  searchArticles: protectedProcedure
    .input(schemaDefinitions.input.search)
    .output(z.array(schemaDefinitions.articleSearch))
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
          orderBy: { createdAt: "desc" },
        });

        return articles.map(article => ({
          ...article,
          status: article.status as ArticleStatus,
        }));
      } catch (error) {
        ErrorHandler.handle(error, ERROR_MESSAGES.SEARCH_FAILED);
      }
    }),

  update: protectedProcedure
    .input(schemaDefinitions.input.update)
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.article.update({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          data: {
            memo: input.memo,
            status: input.status,
          },
        });
      } catch (error) {
        ErrorHandler.handle(error, ERROR_MESSAGES.UPDATE_FAILED);
      }
    }),

  delete: protectedProcedure
    .input(schemaDefinitions.input.delete)
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
        ErrorHandler.handle(error, ERROR_MESSAGES.DELETE_FAILED);
      }
    }),
});