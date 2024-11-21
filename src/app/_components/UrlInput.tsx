"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import type { ArticleDetails } from "~/server/api/routers/article";
import { z } from "zod";

// 定数定義
const PLACEHOLDER_TEXT = "記事のURLを入力してください";
const ARIA_LABEL = "記事を追加";

// 入力データの検証スキーマ
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

  // tRPCクエリの設定
  const { mutate: getArticleDetails, isPending: isSubmitting } =
    api.article.getArticleDetails.useMutation({
      onSuccess: (data) => {
        try {
          // データの検証
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
      new URL(url);
      setError(null);
      getArticleDetails({ url });
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
    <div className="flex flex-col items-center">
      <div
        id="url-input-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: "600px",
          margin: "20px auto",
          background: "linear-gradient(135deg, #ffffff, #f3f4f6)",
          borderRadius: "50px",
          boxShadow: isActive
            ? "0 0 10px 3px rgba(59, 130, 246, 0.8)"
            : error
              ? "0 0 10px 3px rgba(239, 68, 68, 0.5)"
              : "0 10px 20px rgba(0, 0, 0, 0.1)",
          padding: "10px 20px",
          gap: "10px",
          position: "relative",
          transition: "box-shadow 0.3s ease",
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
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            border: error ? "1px solid rgba(239, 68, 68, 0.5)" : "none",
            borderRadius: "50px",
            padding: "10px 20px",
            fontSize: "16px",
            color: "#4a5568",
            outline: "none",
            boxShadow: "inset 0 2px 5px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            opacity: isSubmitting ? 0.7 : 1,
          }}
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
          style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 12px rgba(59, 130, 246, 0.5)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 8px 16px rgba(59, 130, 246, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 6px 12px rgba(59, 130, 246, 0.5)";
            }
          }}
        >
          {isSubmitting ? "..." : "+"}
        </button>
      </div>

      {error && (
        <div
          className="text-red-500 mt-2 text-sm"
          style={{
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
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