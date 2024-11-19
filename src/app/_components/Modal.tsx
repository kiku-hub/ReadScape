"use client";
import { useState } from "react";
import type { ArticleDetails } from "~/server/api/routers/article";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleDetails: ArticleDetails | null;
  onSave: (status: string, memo: string) => Promise<void>;
}

export default function Modal({
  isOpen,
  onClose,
  articleDetails,
  onSave,
}: ModalProps) {
  const [status, setStatus] = useState("WANT_TO_READ");
  const [memo, setMemo] = useState("");

  if (!isOpen || !articleDetails) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(status, memo);
    setMemo(""); // フォームをリセット
  };

  return (
    <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">記事を保存</h2>

        <form onSubmit={handleSubmit}>
          {/* URL表示 */}
          <div className="mb-4">
            <label className="text-gray-700 block text-sm font-medium">
              URL
            </label>
            <p className="text-gray-600 mt-1 text-sm">{articleDetails.url}</p>
          </div>

          {/* ステータス選択 */}
          <div className="mb-4">
            <label className="text-gray-700 block text-sm font-medium">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
            >
              <option value="WANT_TO_READ">読みたい</option>
              <option value="IN_PROGRESS">読んでいる</option>
              <option value="COMPLETED">読了</option>
            </select>
          </div>

          {/* メモ入力 */}
          <div className="mb-4">
            <label className="text-gray-700 block text-sm font-medium">
              メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none"
              rows={3}
            />
          </div>

          {/* ボタン群 */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md border px-4 py-2 text-sm font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md px-4 py-2 text-sm font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
