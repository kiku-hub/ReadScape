import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// 環境変数の検証スキーマを定義
const ENV_SCHEMA = {
  // 認証関連の環境変数
  AUTH: {
    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : str,
      z.string().url()
    ),
  },
  
  // Google OAuth関連の環境変数
  GOOGLE: {
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
  },
  
  // データベース関連の環境変数
  DATABASE: {
    URL: z.string(),
  },
  
  // アプリケーション実行環境
  APP: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
};

// 環境変数の設定を作成
export const env = createEnv({
  server: {
    // 認証設定
    NEXTAUTH_SECRET: ENV_SCHEMA.AUTH.NEXTAUTH_SECRET,
    NEXTAUTH_URL: ENV_SCHEMA.AUTH.NEXTAUTH_URL,
    
    // Google OAuth設定
    GOOGLE_CLIENT_ID: ENV_SCHEMA.GOOGLE.CLIENT_ID,
    GOOGLE_CLIENT_SECRET: ENV_SCHEMA.GOOGLE.CLIENT_SECRET,
    
    // データベース設定
    DATABASE_URL: ENV_SCHEMA.DATABASE.URL,
    
    // アプリケーション設定
    NODE_ENV: ENV_SCHEMA.APP.NODE_ENV,
  },
  
  // クライアントサイドで利用する環境変数（現時点では未使用）
  client: {},
  
  // 実際の環境変数値のマッピング
  runtimeEnv: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  
  // 環境変数のバリデーションスキップフラグ
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  // 空文字列をundefinedとして扱うフラグ
  emptyStringAsUndefined: true,
});