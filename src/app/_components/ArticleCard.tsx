import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import type { ArticleStatus } from "~/server/api/routers/article";

interface ArticleCardProps {
  id: string;
  url: string;
  title?: string;
  description?: string;
  status: ArticleStatus;
  image?: string;
  memo: string;
  onDelete?: (id: string) => void;
  onSave: (id: string, memo: string, status: ArticleStatus) => void;
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
  WANT_TO_READ: "読みたい",
  IN_PROGRESS: "進行中",
  COMPLETED: "読んだ",
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
  // State
  const [localMemo, setLocalMemo] = useState<string>(initialMemo ?? "");
  const [localStatus, setLocalStatus] = useState<ArticleStatus>(initialStatus);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<Metadata>({
    title: initialTitle ?? url,
    description: initialDescription ?? "",
    image: initialImage ?? "",
  });

  // Effects
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

  // Event Handlers
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

  const handleSave = () => {
    if (hasChanges) {
      onSave(id, localMemo, localStatus);
      setHasChanges(false);
    }
  };

  const handleDelete = () => onDelete?.(id);

  return (
    <div className="relative flex rounded-lg bg-white p-4 shadow-sm">
      {/* 左側：画像エリア */}
      <div className="mr-4 w-1/3">
        {metadata.image && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <div className="relative h-32 overflow-hidden rounded-lg">
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
      <div className="flex-1">
        {onDelete && (
          <div className="absolute right-2 top-2">
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-blue-600"
          >
            {isLoading ? "読み込み中..." : metadata.title}
          </a>
        </h3>

        <div className="mb-4">
          <textarea
            value={localMemo}
            onChange={handleMemoChange}
            className="min-h-[80px] w-full resize-none rounded border border-gray-200 bg-white p-3 text-gray-900"
            placeholder="メモを入力..."
          />
        </div>

        <div className="mt-auto flex items-center justify-between">
          <select
            value={STATUS_MAP[localStatus]}
            onChange={handleStatusChange}
            className="rounded border border-gray-200 bg-white px-3 py-2 text-gray-900"
          >
            {Object.entries(STATUS_MAP).map(([key, label]) => (
              <option key={key} value={label}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`rounded px-4 py-2 text-white transition-colors duration-200 ${
              hasChanges
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;