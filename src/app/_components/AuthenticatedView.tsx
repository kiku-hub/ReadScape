"use client";
import { useState } from "react";
import UrlInput from "./UrlInput";
import StatusTabs from "./StatusTabs";
import Modal from "./Modal";
import type { ArticleDetails } from "~/server/api/routers/article";
import { api } from "~/trpc/react";

export default function AuthenticatedView() {
  const [articleDetails, setArticleDetails] = useState<ArticleDetails | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: saveArticle } = api.article.save.useMutation({
    onSuccess: () => {
      handleModalClose();
    },
    onError: (error) => {
      console.error("保存エラー:", error);
    },
  });

  const handleUrlSubmit = (details: ArticleDetails) => {
    setArticleDetails(details);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setArticleDetails(null);
  };

  const handleSave = async (status: string, memo: string) => {
    if (!articleDetails) return;

    try {
      saveArticle({
        url: articleDetails.url,
        status: status as "WANT_TO_READ" | "IN_PROGRESS" | "COMPLETED",
        memo: memo,
      });
    } catch (error) {
      console.error("保存エラー:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#e6ffe9] to-[#c7f4d6]">
      <div className="w-full max-w-4xl px-4 py-8">
        <UrlInput onUrlSubmit={handleUrlSubmit} onModalOpen={handleModalOpen} />
        <div className="mt-2">
          {" "}
          {/* mt-8 から mt-2 に変更 */}
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
