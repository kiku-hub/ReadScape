"use client";

import React from "react";

// 型定義
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  isActive?: boolean;
}

// 定数
const PAGINATION_CONSTANTS = {
  ELLIPSIS: -1,
  VISIBLE_PAGES: 2, // 現在のページの前後に表示するページ数
} as const;

// 共通のボタンコンポーネント
const PaginationButton: React.FC<PaginationButtonProps> = ({
  onClick,
  disabled = false,
  children,
  isActive = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg px-3 py-2 text-sm font-medium ${
      isActive
        ? "bg-blue-500 text-white"
        : "text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
    }`}
  >
    {children}
  </button>
);

// ページ番号の計算ロジック
const calculatePageNumbers = (currentPage: number, totalPages: number): number[] => {
  const pages: number[] = [];
  const { ELLIPSIS, VISIBLE_PAGES } = PAGINATION_CONSTANTS;

  // 最初のページを追加
  pages.push(1);

  // 現在のページの前後のページを追加
  for (
    let i = Math.max(2, currentPage - VISIBLE_PAGES);
    i <= Math.min(totalPages - 1, currentPage + VISIBLE_PAGES);
    i++
  ) {
    if (pages[pages.length - 1] !== i - 1) {
      pages.push(ELLIPSIS);
    }
    pages.push(i);
  }

  // 最後のページを追加
  if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
    if (pages[pages.length - 1] !== totalPages - 1) {
      pages.push(ELLIPSIS);
    }
    pages.push(totalPages);
  }

  return pages;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // 1ページのみの場合は何も表示しない
  if (totalPages <= 1) return null;

  const pageNumbers = calculatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        前へ
      </PaginationButton>

      {pageNumbers.map((pageNum, index) => (
        <React.Fragment key={`page-${pageNum}-${index}`}>
          {pageNum === PAGINATION_CONSTANTS.ELLIPSIS ? (
            <span className="px-2 text-gray-500">...</span>
          ) : (
            <PaginationButton
              onClick={() => onPageChange(pageNum)}
              isActive={currentPage === pageNum}
            >
              {pageNum}
            </PaginationButton>
          )}
        </React.Fragment>
      ))}

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </PaginationButton>
    </div>
  );
};

export default Pagination;