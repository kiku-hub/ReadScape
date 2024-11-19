"use client";

import { useState } from "react";
import Image from "next/image";
import type { ArticleDetails } from "~/server/api/routers/article";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleDetails: ArticleDetails | null;
  onSave: (status: string, comment: string) => void;
}

export default function Modal({
  isOpen,
  onClose,
  articleDetails,
  onSave,
}: ModalProps) {
  const [status, setStatus] = useState<string>("読みたい");
  const [comment, setComment] = useState<string>("");

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
                <h2 className="text-gray-800 mb-4 text-2xl font-bold">
                  {articleDetails.title}
                </h2>
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
                {articleDetails.thumbnail && (
                  <div className="mt-6 overflow-hidden rounded-xl">
                    <Image
                      src={articleDetails.thumbnail}
                      alt={articleDetails.title}
                      width={500}
                      height={300}
                      className="w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
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
