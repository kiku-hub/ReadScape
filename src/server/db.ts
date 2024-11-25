import { PrismaClient } from "@prisma/client";
import { env } from "~/env";

/**
 * Prismaクライアントの設定オプション
 * 開発環境では詳細なログを出力し、本番環境ではエラーのみを出力
 */
const PRISMA_OPTIONS = {
  log: env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
} as const;

/**
 * PrismaClientのインスタンスを生成する関数
 * テスト時のモック化を容易にするため、関数として切り出し
 */
const createPrismaClient = () => new PrismaClient(PRISMA_OPTIONS);

/**
 * グローバルスコープの型定義
 * HMR（Hot Module Replacement）時に複数のPrismaインスタンスが作成されることを防ぐ
 */
type GlobalWithPrisma = typeof globalThis & {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

/**
 * データベース接続のシングルトンインスタンス
 * 既存のインスタンスがある場合は再利用し、ない場合は新規作成
 */
export const db = globalForPrisma.prisma ?? createPrismaClient();

/**
 * 開発環境でのみグローバルインスタンスを保持
 * 本番環境では不要なメモリ使用を避けるため、保持しない
 */
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}