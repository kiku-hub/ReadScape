"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ArticleStatus } from "~/server/api/routers/article";
import LoadingSpinner from "./LoadingSpinner";

// ===============================
// 型定義
// ===============================
type LoadingState = "DELETE" | "SAVE" | "FETCH";

interface ArticleApiResponse {
  title: string | null;
  description: string | null;
  image: string | null;
  error?: {
    message: string;
  };
}

interface ArticleMetadata {
  title: string;
  description: string;
  image: string;
}

interface ArticleCardProps {
  id: string;
  url: string;
  title?: string;
  description?: string;
  status: ArticleStatus;
  image?: string;
  memo: string;
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string, memo: string, status: ArticleStatus) => Promise<void>;
  onMetadataUpdate?: (id: string, metadata: ArticleMetadata) => void;
}

// ===============================
// 定数
// ===============================
const STATUS_MAP: Record<ArticleStatus, string> = {
  WANT_TO_READ: "未読",
  IN_PROGRESS: "読書中",
  COMPLETED: "読了",
} as const;

const LOADING_MESSAGES: Record<LoadingState, string> = {
  DELETE: "削除中...",
  SAVE: "保存中...",
  FETCH: "読み込み中...",
} as const;

const API_ENDPOINTS = {
  FETCH_ARTICLE_INFO: "/api/fetch-article-info",
} as const;

// ===============================
// カスタムフック: メタデータ取得
// ===============================
interface UseArticleMetadataResult {
  metadata: ArticleMetadata;
  isLoading: boolean;
  error: Error | null;
}

const useArticleMetadata = (
  url: string,
  id: string,
  initialData: Partial<ArticleMetadata>,
  onMetadataUpdate?: (id: string, metadata: ArticleMetadata) => void
): UseArticleMetadataResult => {
  const [metadata, setMetadata] = useState<ArticleMetadata>({
    title: initialData.title ?? url,
    description: initialData.description ?? "",
    image: initialData.image ?? "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const hasAllMetadata = initialData.title && initialData.description && initialData.image;
    if (hasAllMetadata) return;

    const fetchMetadata = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINTS.FETCH_ARTICLE_INFO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as ArticleApiResponse;
        if (data.error) throw new Error(data.error.message);

        const newMetadata: ArticleMetadata = {
          title: data.title ?? url,
          description: data.description ?? "",
          image: data.image ?? "",
        };

        setMetadata(newMetadata);
        onMetadataUpdate?.(id, newMetadata);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(new Error(errorMessage));
        setMetadata((prev) => ({ ...prev, title: url }));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMetadata();
  }, [url, id, onMetadataUpdate, initialData.title, initialData.description, initialData.image]);

  return { metadata, isLoading, error };
};

// ===============================
// カスタムフック: 記事の状態管理
// ===============================
interface ArticleState {
  localMemo: string;
  localStatus: ArticleStatus;
  hasChanges: boolean;
  isSaving: boolean;
  setLocalMemo: (memo: string) => void;
  setLocalStatus: (status: ArticleStatus) => void;
  handleSave: () => Promise<void>;
}

const useArticleState = (
  id: string,
  initialMemo: string,
  initialStatus: ArticleStatus,
  onSave: (id: string, memo: string, status: ArticleStatus) => Promise<void>
): ArticleState => {
  const [localMemo, setLocalMemo] = useState(initialMemo);
  const [localStatus, setLocalStatus] = useState(initialStatus);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalMemo(initialMemo);
    setLocalStatus(initialStatus);
    setHasChanges(false);
  }, [initialMemo, initialStatus]);

  const handleSave = async (): Promise<void> => {
    if (!hasChanges) return;
    
    try {
      setIsSaving(true);
      await onSave(id, localMemo, localStatus);
      setHasChanges(false);
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalMemo = (memo: string) => {
    setLocalMemo(memo);
    setHasChanges(true);
  };

  const updateLocalStatus = (status: ArticleStatus) => {
    setLocalStatus(status);
    setHasChanges(true);
  };

  return {
    localMemo,
    localStatus,
    hasChanges,
    isSaving,
    setLocalMemo: updateLocalMemo,
    setLocalStatus: updateLocalStatus,
    handleSave,
  };
};

// ===============================
// サブコンポーネント
// ===============================
interface ArticleImageProps {
  url: string;
  image: string;
  title: string;
}

const ArticleImage: React.FC<ArticleImageProps> = ({ url, image, title }) => (
  <div className="mb-3 sm:mb-0 sm:mr-4 w-full sm:w-1/3">
    {image && (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <div className="relative h-40 sm:h-28 overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </a>
    )}
  </div>
);

// ===============================
// メインコンポーネント
// ===============================
export const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  url,
  title: initialTitle,
  description: initialDescription,
  status: initialStatus,
  image: initialImage,
  memo: initialMemo,
  onDelete,
  onSave,
  onMetadataUpdate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { metadata, isLoading } = useArticleMetadata(
    url,
    id,
    { title: initialTitle, description: initialDescription, image: initialImage },
    onMetadataUpdate
  );

  const {
    localMemo,
    localStatus,
    hasChanges,
    isSaving,
    setLocalMemo,
    setLocalStatus,
    handleSave,
  } = useArticleState(id, initialMemo ?? "", initialStatus, onSave);

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error);
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Object.entries(STATUS_MAP).find(
      ([_, label]) => label === e.target.value
    )?.[0] as ArticleStatus;

    if (newStatus) {
      setLocalStatus(newStatus);
    }
  };

  if (isDeleting || isSaving) {
    return (
      <div className="relative h-[240px] w-full rounded-lg bg-white p-4 shadow-sm">
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner message={isDeleting ? LOADING_MESSAGES.DELETE : LOADING_MESSAGES.SAVE} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-auto sm:h-[240px] w-full rounded-lg bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex h-full flex-col sm:flex-row">
        <ArticleImage url={url} image={metadata.image} title={metadata.title} />

        <div className="flex flex-1 flex-col">
          <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
            <button
              onClick={() => void handleDelete()}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors duration-200"
              aria-label="記事を削除"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <h3 className="mb-2 mt-1 pr-12 line-clamp-2 text-base sm:text-lg font-semibold text-gray-900">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-blue-600"
            >
              {isLoading ? LOADING_MESSAGES.FETCH : metadata.title}
            </a>
          </h3>

          <div className="mb-3 flex-1">
            <textarea
              value={localMemo}
              onChange={(e) => setLocalMemo(e.target.value)}
              className="h-20 sm:h-16 w-full resize-none rounded border border-gray-200 bg-white p-2 sm:p-3 text-sm sm:text-base text-gray-900"
              placeholder="メモを入力..."
              aria-label="記事メモ"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={STATUS_MAP[localStatus]}
              onChange={handleStatusChange}
              className="rounded border border-gray-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900"
              aria-label="記事のステータス"
            >
              {Object.entries(STATUS_MAP).map(([key, label]) => (
                <option key={key} value={label}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={() => void handleSave()}
              disabled={!hasChanges || isSaving}
              className={`rounded px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white transition-colors duration-200 ${
                hasChanges && !isSaving
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "cursor-not-allowed bg-gray-400"
              }`}
              aria-label="変更を保存"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;