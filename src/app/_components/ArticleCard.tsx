"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ArticleStatus } from "~/server/api/routers/article";
import LoadingSpinner from "./LoadingSpinner";

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
  onMetadataUpdate?: (id: string, metadata: Metadata) => void;
}

interface Metadata {
  title: string;
  description: string;
  image: string;
}

interface ApiResponse {
  title: string;
  description: string;
  image: string;
  error?: {
    message: string;
  };
}

const STATUS_MAP: Record<ArticleStatus, string> = {
  WANT_TO_READ: "未読",
  IN_PROGRESS: "読書中",
  COMPLETED: "読了",
} as const;

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
  const [localMemo, setLocalMemo] = useState<string>(initialMemo ?? "");
  const [localStatus, setLocalStatus] = useState<ArticleStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<Metadata>({
    title: initialTitle ?? url,
    description: initialDescription ?? "",
    image: initialImage ?? "",
  });

  useEffect(() => {
    setLocalMemo(initialMemo ?? "");
    setLocalStatus(initialStatus);
    setHasChanges(false);
  }, [initialMemo, initialStatus]);

  useEffect(() => {
    const fetchMetadata = async (): Promise<void> => {
      if (initialTitle && initialDescription && initialImage) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/fetch-article-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) throw new Error("Failed to fetch metadata");

        const data = (await response.json()) as ApiResponse;
        if (data.error) throw new Error(data.error.message);

        const newMetadata: Metadata = {
          title: data.title ?? url,
          description: data.description ?? "",
          image: data.image ?? "",
        };

        setMetadata(newMetadata);
        onMetadataUpdate?.(id, newMetadata);
      } catch (error) {
        console.error("Error fetching metadata:", error);
        setMetadata((prev) => ({ ...prev, title: url }));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMetadata();
  }, [
    url,
    id,
    onMetadataUpdate,
    initialTitle,
    initialDescription,
    initialImage,
  ]);

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalMemo(e.target.value);
    setHasChanges(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Object.entries(STATUS_MAP).find(
      ([_, label]) => label === e.target.value,
    )?.[0] as ArticleStatus;

    if (newStatus) {
      setLocalStatus(newStatus);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (hasChanges) {
      try {
        setIsSaving(true);
        await onSave(id, localMemo, localStatus);
        setHasChanges(false);
      } catch (error) {
        console.error("保存中にエラーが発生しました:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error);
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="relative h-[240px] sm:h-[240px] w-full rounded-lg bg-white p-4 shadow-sm">
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner message="削除中..." />
        </div>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="relative h-[240px] sm:h-[240px] w-full rounded-lg bg-white p-4 shadow-sm">
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner message="保存中..." />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-auto sm:h-[240px] w-full rounded-lg bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex h-full flex-col sm:flex-row">
        {/* 左側：画像エリア */}
        <div className="mb-3 sm:mb-0 sm:mr-4 w-full sm:w-1/3">
          {metadata.image && (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <div className="relative h-40 sm:h-28 overflow-hidden rounded-lg">
                <Image
                  src={metadata.image}
                  alt={metadata.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            </a>
          )}
        </div>

        {/* 右側：コンテンツエリア */}
        <div className="flex flex-1 flex-col">
          <div className="absolute right-2 top-2">
            <button
              onClick={() => void handleDelete()}
              className="text-gray-400 hover:text-red-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base sm:text-lg font-semibold text-gray-900">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-blue-600"
            >
              {isLoading ? "読み込み中..." : metadata.title}
            </a>
          </h3>

          <div className="mb-3 flex-1">
            <textarea
              value={localMemo}
              onChange={handleMemoChange}
              className="h-20 sm:h-16 w-full resize-none rounded border border-gray-200 bg-white p-2 sm:p-3 text-sm sm:text-base text-gray-900"
              placeholder="メモを入力..."
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <select
              value={STATUS_MAP[localStatus]}
              onChange={handleStatusChange}
              className="rounded border border-gray-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900"
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