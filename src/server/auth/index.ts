/**
 * 認証関連の機能をまとめたモジュール
 * NextAuthの設定とキャッシュ管理を行う
 */

import NextAuth from "next-auth";
import { cache } from "react";
import { authConfig } from "./config";

// NextAuthの初期化と必要な機能の分割代入
const {
  auth: uncachedAuth,
  handlers,
  signIn,
  signOut,
} = NextAuth(authConfig);

// パフォーマンス向上のためのキャッシュ処理
// Reactのcache関数を使用して認証状態をメモ化
const auth = cache(uncachedAuth);

// 認証関連の機能をエクスポート
// auth: 認証状態の取得
// handlers: 認証ハンドラー
// signIn: サインイン処理
// signOut: サインアウト処理
export { auth, handlers, signIn, signOut };