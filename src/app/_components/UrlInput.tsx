"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import type { ArticleDetails } from "~/server/api/routers/article";
import { z } from "zod";

const PLACEHOLDER_TEXT = "記事のURLを入力してください";
const ARIA_LABEL = "記事を追加";

const articleDataSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
});

interface UrlInputProps {
  onUrlSubmit: (articleDetails: ArticleDetails) => void;
  onModalOpen: () => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, onModalOpen }) => {
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: getArticleDetails, isPending: isSubmitting } =
    api.article.getArticleDetails.useMutation({
      onSuccess: (data) => {
        try {
          const validatedData = articleDataSchema.parse(data);
          const safeData: ArticleDetails = {
            title: validatedData.title,
            url: validatedData.url,
            thumbnail: validatedData.thumbnail,
            description: validatedData.description,
          };

          setError(null);
          onUrlSubmit(safeData);
          onModalOpen();
          setUrl("");
        } catch (err) {
          setError("無効なデータ形式です");
          console.error("Data validation error:", err);
        }
      },
      onError: (err) => {
        const errorMessage =
          err instanceof Error ? err.message : "エラーが発生しました";
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
      },
    });

  const handleInputClick = () => {
    setIsActive(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void handleAddClick();
    }
  };

  const handleAddClick = async () => {
    if (!url.trim()) {
      setError("URLを入力してください");
      return;
    }

    try {
      const urlObject = new URL(url);
      if (!['http:', 'https:'].includes(urlObject.protocol)) {
        setError("HTTPまたはHTTPSのURLを入力してください");
        return;
      }
      setError(null);
      getArticleDetails({ url: urlObject.href });
    } catch {
      setError("有効なURLを入力してください");
    }
  };

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    const container = document.getElementById("url-input-container");
    const target = event.target as Node;

    if (container && !container.contains(target)) {
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div className="fixed top-22 left-0 right-0 flex flex-col items-center z-40 px-4 md:px-0">
      <div
        id="url-input-container"
        className="flex items-center justify-center w-full max-w-[600px] mx-auto my-5 bg-gradient-to-r from-white to-gray-50 rounded-full shadow-lg transition-shadow duration-300 px-3 md:px-5 py-2 md:py-3 gap-2 md:gap-4"
        style={{
          boxShadow: isActive
            ? "0 0 10px 3px rgba(59, 130, 246, 0.8)"
            : error
              ? "0 0 10px 3px rgba(239, 68, 68, 0.5)"
              : "0 10px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onClick={handleInputClick}
          onKeyPress={handleKeyPress}
          placeholder={PLACEHOLDER_TEXT}
          disabled={isSubmitting}
          className={`flex-1 bg-white rounded-full py-2 md:py-3 px-4 md:px-6 text-sm md:text-base text-gray-600 outline-none shadow-inner transition-all duration-300 ${
            error ? "border border-red-400" : "border-none"
          } ${isSubmitting ? "opacity-70" : "opacity-100"}`}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            setError(null);
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
          }}
        />
        <button
          onClick={() => void handleAddClick()}
          aria-label={ARIA_LABEL}
          disabled={isSubmitting}
          className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transition-all duration-300 ${
            isSubmitting
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:scale-110 hover:shadow-xl"
          }`}
        >
          {isSubmitting ? "..." : "+"}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mt-2 text-xs md:text-sm animate-fadeIn">
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UrlInput;