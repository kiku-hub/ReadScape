"use client";
import { useState } from "react";
import UrlInput from "./UrlInput";
import StatusTabs from "./StatusTabs";
import Modal from "./Modal";
import type { ArticleDetails } from "~/server/api/routers/article";
import { api } from "~/trpc/react";

// 記事のステータスを定義
type ArticleStatus = "WANT_TO_READ" | "IN_PROGRESS" | "COMPLETED";

// カスタムフック: 記事の保存ロジックを分離
function useArticleSave(onSuccess: () => void) {
  return api.article.save.useMutation({
    onSuccess,
    onError: (error) => {
      console.error("Article save error:", error);
    },
  });
}

// カスタムフック: モーダルの状態管理
function useModalState() {
  const [isOpen, setIsOpen] = useState(false);
  const [articleDetails, setArticleDetails] = useState<ArticleDetails | null>(
    null
  );

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setArticleDetails(null);
  };

  return {
    isOpen,
    articleDetails,
    setArticleDetails,
    openModal,
    closeModal,
  };
}

export default function AuthenticatedView() {
  // モーダルの状態管理
  const {
    isOpen: isModalOpen,
    articleDetails,
    setArticleDetails,
    openModal: handleModalOpen,
    closeModal: handleModalClose,
  } = useModalState();

  // 記事保存のミューテーション
  const { mutate: saveArticle } = useArticleSave(handleModalClose);

  /**
   * URL送信時のハンドラー
   * @param details 記事の詳細情報
   */
  const handleUrlSubmit = (details: ArticleDetails) => {
    setArticleDetails(details);
  };

  /**
   * 記事保存時のハンドラー
   * @param status 記事のステータス
   * @param memo メモ内容
   */
  const handleSave = async (status: string, memo: string) => {
    if (!articleDetails) return;

    try {
      saveArticle({
        url: articleDetails.url,
        status: status as ArticleStatus,
        memo,
      });
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div className="bg-white flex min-h-screen flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-8">
        <UrlInput onUrlSubmit={handleUrlSubmit} onModalOpen={handleModalOpen} />
        <div className="mt-2">
          <StatusTabs />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        articleDetails={articleDetails}
        onSave={handleSave}
      />
    </div>
  );
}