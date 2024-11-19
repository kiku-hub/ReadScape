"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ArticleDetails } from "~/server/api/routers/article";

// APIレスポンスの型定義
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
  onSave: (status: string, comment: string) => void;
}

interface ArticleInfo {
  title: string;
  description: string;
  image: string;
}

export default function Modal({
  isOpen,
  onClose,
  articleDetails,
  onSave,
}: ModalProps) {
  console.log("Modal props:", { isOpen, articleDetails });
  const [status, setStatus] = useState<string>("読みたい");
  const [comment, setComment] = useState<string>("");
  const [articleInfo, setArticleInfo] = useState<ArticleInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArticleInfo = async () => {
      if (articleDetails?.url) {
        setIsLoading(true);
        try {
          console.log("Fetching article info for:", articleDetails.url);
          const response = await fetch("/api/fetch-article-info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: articleDetails.url }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = (await response.json()) as ArticleApiResponse;
          console.log("Received article info:", data);

          if ("error" in data && data.error) {
            console.error("記事情報の取得に失敗しました:", data.error.message);
          } else {
            setArticleInfo({
              title: data.title ?? articleDetails.title,
              description: data.description ?? "",
              image: data.image ?? articleDetails.thumbnail ?? "",
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          console.error("記事情報の取得に失敗しました:", errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isOpen && articleDetails) {
      void fetchArticleInfo();
    }
  }, [isOpen, articleDetails]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStatus("読みたい");
    setComment("");
    onClose();
  };

  const handleSave = () => {
    onSave(status, comment);
    handleClose();
  };

  return (
    <div className="bg-white/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
      <div className="bg-white relative w-full max-w-2xl transform overflow-hidden rounded-3xl shadow-lg transition-all duration-300">
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
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
          {articleDetails ? (
            <>
              {/* 記事情報の表示 */}
              <div className="mb-8">
                {(articleInfo?.image ?? articleDetails.thumbnail) && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={articleInfo?.image ?? articleDetails.thumbnail ?? ""}
                      alt={articleInfo?.title ?? articleDetails.title ?? ""}
                      width={600}
                      height={315}
                      className="h-[200px] w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <h2 className="text-gray-800 mb-4 line-clamp-2 text-xl font-bold">
                  {articleInfo?.title ?? articleDetails.title}
                </h2>
                {articleInfo?.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {articleInfo.description}
                  </p>
                )}
                <a
                  href={articleDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 inline-flex items-center hover:underline"
                >
                  記事を開く
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              {/* ステータス選択 */}
              <div className="mb-6">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  ステータス
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border-gray-300 bg-gray-50 text-gray-700 focus:border-blue-500 focus:ring-blue-200 block w-full rounded-lg p-3 shadow-sm focus:ring"
                >
                  <option value="読みたい">読みたい</option>
                  <option value="進行中">進行中</option>
                  <option value="読んだ">読んだ</option>
                </select>
              </div>

              {/* コメント入力 */}
              <div className="mb-8">
                <label className="text-gray-700 mb-2 block text-sm font-medium">
                  コメント
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="border-gray-300 bg-gray-50 text-gray-700 focus:border-blue-500 focus:ring-blue-200 block w-full rounded-lg p-3 shadow-sm focus:ring"
                  placeholder="コメントを入力してください"
                  rows={4}
                />
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300 inline-flex items-center rounded-lg px-6 py-3 text-sm font-medium shadow focus:outline-none focus:ring-2"
                >
                  保存
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-6">データが見つかりません</p>
              <button
                onClick={handleClose}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 inline-flex items-center rounded-lg px-6 py-2 text-sm font-medium"
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
