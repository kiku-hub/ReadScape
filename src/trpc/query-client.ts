import {
  defaultShouldDehydrateQuery,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";
import SuperJSON from "superjson";

// キャッシュの設定値を定数として管理
const CACHE_CONFIG = {
  STALE_TIME: 30 * 1000, // 30秒
} as const;

// シリアライズ設定をオブジェクトとして分離
const SERIALIZATION_CONFIG = {
  serialize: SuperJSON.serialize,
  deserialize: SuperJSON.deserialize,
} as const;

// QueryClientの設定をオブジェクトとして分離
const DEFAULT_QUERY_CONFIG: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // SSRの場合、クライアント側での即時再フェッチを防ぐため
      // staleTimeにデフォルト値を設定
      staleTime: CACHE_CONFIG.STALE_TIME,
      
      // エラー時の再試行を3回までに制限
      retry: 3,
      
      // キャッシュの保持時間を設定 (cacheTime → gcTime)
      gcTime: CACHE_CONFIG.STALE_TIME * 2,
    },
    dehydrate: {
      serializeData: SERIALIZATION_CONFIG.serialize,
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) ||
        query.state.status === "pending",
    },
    hydrate: {
      deserializeData: SERIALIZATION_CONFIG.deserialize,
    },
  },
};

/**
 * QueryClientインスタンスを生成する関数
 * @returns {QueryClient} 設定済みのQueryClientインスタンス
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient(DEFAULT_QUERY_CONFIG);
};