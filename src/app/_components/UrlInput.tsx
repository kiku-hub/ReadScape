"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import type { ArticleDetails } from "~/server/api/routers/article";
import { z } from "zod";

// 定数の集約
const CONSTANTS = {
  PLACEHOLDER: "記事のURLを入力してください",
  ARIA_LABEL: "記事を追加",
  ERROR_MESSAGES: {
    EMPTY_URL: "URLを入力してください",
    INVALID_URL: "有効なURLを入力してください",
    INVALID_PROTOCOL: "HTTPまたはHTTPSのURLを入力してください",
    INVALID_DATA: "無効なデータ形式です",
    GENERIC_ERROR: "エラーが発生しました",
  },
  ERROR_TIMEOUT: 3000,
} as const;

// バリデーションスキーマの定義
const articleDataSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
});

type ValidationResult = {
  isValid: boolean;
  error?: string;
  url?: string;
};

// Props型の定義
interface UrlInputProps {
  onUrlSubmit: (articleDetails: ArticleDetails) => void;
  onModalOpen: () => void;
}

// URLバリデーション関数
const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: CONSTANTS.ERROR_MESSAGES.EMPTY_URL };
  }

  try {
    const urlObject = new URL(url);
    if (!["http:", "https:"].includes(urlObject.protocol)) {
      return { isValid: false, error: CONSTANTS.ERROR_MESSAGES.INVALID_PROTOCOL };
    }
    return { isValid: true, url: urlObject.href };
  } catch {
    return { isValid: false, error: CONSTANTS.ERROR_MESSAGES.INVALID_URL };
  }
};

// カスタムフック: 記事詳細の取得と状態管理
const useArticleDetails = (onUrlSubmit: UrlInputProps["onUrlSubmit"], onModalOpen: UrlInputProps["onModalOpen"]) => {
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
        } catch (err) {
          setError(CONSTANTS.ERROR_MESSAGES.INVALID_DATA);
          console.error("Data validation error:", err);
        }
      },
      onError: (err) => {
        const errorMessage =
          err instanceof Error ? err.message : CONSTANTS.ERROR_MESSAGES.GENERIC_ERROR;
        setError(errorMessage);
        setTimeout(() => setError(null), CONSTANTS.ERROR_TIMEOUT);
      },
    });

  return { getArticleDetails, isSubmitting, error, setError };
};

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, onModalOpen }) => {
  const [url, setUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const { getArticleDetails, isSubmitting, error, setError } = useArticleDetails(
    onUrlSubmit,
    onModalOpen
  );

  // URL送信ハンドラー
  const handleSubmit = () => {
    const validation = validateUrl(url);
    if (!validation.isValid) {
      setError(validation.error ?? CONSTANTS.ERROR_MESSAGES.INVALID_URL);
      return;
    }

    getArticleDetails({ url: validation.url! });
    setUrl("");
  };

  // クリックイベントハンドラー
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    const container = document.getElementById("url-input-container");
    if (container && !container.contains(event.target as Node)) {
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
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
          onClick={() => setIsActive(true)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={CONSTANTS.PLACEHOLDER}
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
          onClick={handleSubmit}
          aria-label={CONSTANTS.ARIA_LABEL}
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