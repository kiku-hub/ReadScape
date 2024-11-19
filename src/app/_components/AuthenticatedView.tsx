"use client";
import { useState } from "react";
import UrlInput from "./UrlInput";
import StatusTabs from "./StatusTabs";
import Modal from "./Modal";
import type { ArticleDetails } from "~/server/api/routers/article";

export default function AuthenticatedView() {
  // 状態管理
  const [articleDetails, setArticleDetails] = useState<ArticleDetails | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URLInput用のハンドラー
  const handleUrlSubmit = (details: ArticleDetails) => {
    setArticleDetails(details);
  };

  // モーダル制御用のハンドラー
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setArticleDetails(null); // モーダルを閉じる際にデータもクリア
  };

  // 記事保存用のハンドラー
  const handleSave = async (status: string, comment: string) => {
    if (!articleDetails) return;

    try {
      // TODO: 記事保存のAPI呼び出し
      console.log("保存データ:", {
        articleDetails,
        status,
        comment,
      });

      // 保存成功時の処理
      handleModalClose();
      // TODO: 必要に応じて成功メッセージの表示やリストの更新
    } catch (error) {
      console.error("保存エラー:", error);
      // TODO: エラーメッセージの表示
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#e6ffe9] to-[#c7f4d6]">
      {/* URL入力フォーム */}
      <div className="w-full max-w-4xl px-4 py-8">
        <UrlInput onUrlSubmit={handleUrlSubmit} onModalOpen={handleModalOpen} />
      </div>

      {/* タブ表示部分 */}
      <div className="mt-8 w-full max-w-4xl px-4">
        <StatusTabs />
      </div>

      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        articleDetails={articleDetails}
        onSave={handleSave}
      />
    </div>
  );
}
