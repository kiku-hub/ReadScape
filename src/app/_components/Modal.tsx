"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ArticleDetails } from "~/server/api/routers/article";
import LoadingSpinner from "./LoadingSpinner";

// 定数定義
const ARTICLE_STATUSES = {
  WANT_TO_READ: "未読",
  IN_PROGRESS: "読書中",
  COMPLETED: "読了",
} as const;

// 型定義
interface ArticleApiResponse {
  title: string;
  description: string;
  image: string;
  error?: {
    message: string;
    details?: string;
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleDetails: ArticleDetails | null;
  onSave: (status: string, memo: string) => Promise<void>;
}

interface ArticleInfo {
  title: string;
  image: string;
}

// カスタムフック: 記事情報の取得ロジック
const useArticleInfo = (isOpen: boolean, articleDetails: ArticleDetails | null) => {
  const [articleInfo, setArticleInfo] = useState<ArticleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArticleInfo = async () => {
      if (!articleDetails?.url) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/fetch-article-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: articleDetails.url }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as ArticleApiResponse;

        if ("error" in data && data.error) {
          console.error("記事情報の取得に失敗しました:", data.error.message);
          return;
        }

        setArticleInfo({
          title: data.title ?? "タイトルなし",
          image: data.image ?? "",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("記事情報の取得に失敗しました:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && articleDetails) {
      void fetchArticleInfo();
    }
  }, [isOpen, articleDetails]);

  return { articleInfo, isLoading };
};

export default function Modal({
  isOpen,
  onClose,
  articleDetails,
  onSave,
}: ModalProps) {
  const [status, setStatus] = useState<string>("WANT_TO_READ");
  const [memo, setMemo] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const { articleInfo, isLoading } = useArticleInfo(isOpen, articleDetails);

  if (!isOpen) return null;

  // モーダルを閉じる際の状態リセット
  const handleClose = () => {
    setStatus("WANT_TO_READ");
    setMemo("");
    onClose();
  };

  // 保存処理
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(status, memo);
      // UX向上のための遅延
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // 記事情報表示コンポーネント
  const ArticleContent = () => (
    <div className="mb-8">
      <a
        href={articleDetails?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {articleInfo?.image && (
          <div className="mb-4 overflow-hidden rounded-xl">
            <div className="relative mx-auto h-48 w-3/4 transition-transform duration-300 group-hover:scale-105">
              <Image
                src={articleInfo.image}
                alt={articleInfo.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
        <h2 className="mb-4 line-clamp-2 text-xl font-bold text-gray-800 transition-colors duration-200 hover:text-blue-600">
          {articleInfo?.title ?? "タイトルなし"}
        </h2>
      </a>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-300">
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 transition-all duration-200 hover:bg-gray-300 hover:text-gray-700"
          aria-label="閉じる"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-8">
          {isLoading || isSaving ? (
            <div className="h-[400px]">
              <LoadingSpinner
                message={isLoading ? "読み込み中..." : "保存中..."}
              />
            </div>
          ) : articleDetails ? (
            <>
              <ArticleContent />
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  ステータス
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                >
                  {Object.entries(ARTICLE_STATUSES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  メモ
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-3 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="メモを入力してください"
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                  className="inline-flex items-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="mb-6 text-gray-500">データが見つかりません</p>
              <button
                onClick={handleClose}
                className="inline-flex items-center rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}