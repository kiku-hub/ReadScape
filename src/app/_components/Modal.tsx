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
    // モーダルを閉じる際に状態を初期化
    setStatus("読みたい");
    setComment("");
    onClose();
  };

  const handleSave = () => {
    onSave(status, comment);
    handleClose();
  };

  return (
    <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="bg-white w-full max-w-2xl rounded-lg p-6 shadow-xl">
        {articleDetails ? (
          <>
            {/* 記事情報の表示 */}
            <div className="mb-4">
              <h2 className="mb-2 text-xl font-bold">{articleDetails.title}</h2>
              <a
                href={articleDetails.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                {articleDetails.url}
              </a>
              {articleDetails.description && (
                <p className="text-gray-600 mt-2">
                  {articleDetails.description}
                </p>
              )}
              {articleDetails.thumbnail && (
                <Image
                  src={articleDetails.thumbnail}
                  alt={articleDetails.title}
                  width={500}
                  height={300}
                  className="mt-4 max-h-48 rounded object-cover"
                />
              )}
            </div>

            {/* ステータス選択 */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block font-bold">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="読みたい">読みたい</option>
                <option value="進行中">進行中</option>
                <option value="読んだ">読んだ</option>
              </select>
            </div>

            {/* コメント入力 */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block font-bold">
                コメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-32 w-full rounded-lg border p-2"
                placeholder="この記事に対するコメントを入力してください"
              />
            </div>

            {/* ボタン群 */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleClose}
                className="hover:bg-gray-100 rounded-lg border px-4 py-2"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg px-4 py-2"
              >
                保存
              </button>
            </div>
          </>
        ) : (
          // データが取得できなかった場合
          <div className="text-center">
            <p className="text-gray-600 mb-4">データが見つかりません</p>
            <button
              onClick={handleClose}
              className="bg-gray-300 hover:bg-gray-400 rounded-lg px-4 py-2"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
