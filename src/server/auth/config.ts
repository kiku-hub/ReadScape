import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

// カスタムセッション型の定義
interface CustomSession extends DefaultSession {
  user: {
    id: string;
    email: string | null | undefined;
    name: string | null | undefined;
    image: string | null | undefined;
  }
}

// 環境変数の型定義
interface AuthEnvironmentVariables {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

// 環境変数のバリデーション
const validateEnvironmentVariables = (): AuthEnvironmentVariables => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    throw new Error(
      "必要な環境変数が設定されていません。GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET を確認してください。"
    );
  }

  return {
    GOOGLE_CLIENT_ID: googleClientId,
    GOOGLE_CLIENT_SECRET: googleClientSecret,
  };
};

// Google認証プロバイダーの設定
const configureGoogleProvider = (env: AuthEnvironmentVariables) => {
  return GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  });
};

/**
 * NextAuth.jsの設定
 * アダプター、プロバイダー、コールバックなどの設定を行います
 */
export const authConfig = {
  providers: [configureGoogleProvider(validateEnvironmentVariables())],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }): CustomSession => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;

// next-authの型拡張
declare module "next-auth" {
  interface Session extends CustomSession {
    user: {
      id: string;
      email: string | null | undefined;
      name: string | null | undefined;
      image: string | null | undefined;
    }
  }
}