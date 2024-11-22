"use client";

import dynamic from 'next/dynamic';
import { useState } from "react";
import { Box, TextField, Typography, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "~/trpc/react";
import ArticleCard from "./ArticleCard";
import { useDebounce } from "~/hooks/useDebounce";
import type { ArticleStatus } from "~/server/api/routers/article";

const IconButton = dynamic(
  () => import('@mui/material/IconButton'),
  { ssr: false }
);

const Modal = dynamic(
  () => import('@mui/material/Modal'),
  { ssr: false }
);

interface SearchResult {
  id: string;
  status: string;
  createdAt: Date;
  url: string;
  title: string; // titleプロパティを追加
  memo: string | null;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const utils = api.useContext();

  const { data: searchResults = [] } = api.article.searchArticles.useQuery<SearchResult[]>(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0 && open,
    }
  );

  const deleteMutation = api.article.delete.useMutation({
    onSuccess: () => {
      void utils.article.searchArticles.invalidate();
    },
  });

  const updateMutation = api.article.update.useMutation({
    onSuccess: () => {
      void utils.article.searchArticles.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error("削除中にエラーが発生しました:", error);
    }
  };

  const handleSave = async (id: string, memo: string, status: ArticleStatus) => {
    try {
      await updateMutation.mutateAsync({ id, memo, status });
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
    }
  };

  return (
    <>
      <Tooltip 
        title="記事を検索" 
        placement="right"
        arrow
        sx={{
          '& .MuiTooltip-tooltip': {
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            fontSize: '0.75rem',
            borderRadius: '4px',
            padding: '4px 8px',
          },
          '& .MuiTooltip-arrow': {
            color: 'rgba(76, 175, 80, 0.9)',
          },
        }}
      >
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            top: { xs: '8px', sm: '16px' },
            left: { xs: '180px', sm: '220px' },
            padding: '4px',
            height: { xs: '32px', sm: '36px' },
            width: { xs: '32px', sm: '36px' },
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid transparent',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
            transition: 'all 0.3s ease',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          <SearchIcon />
        </IconButton>
      </Tooltip>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSearchQuery("");
        }}
        aria-labelledby="search-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '600px' },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: 'auto',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="タイトル、URL、メモで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => {
              setOpen(false);
              setSearchQuery("");
            }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ mt: 2 }}>
            {searchResults.length === 0 && searchQuery && (
              <Typography color="text.secondary" align="center">
                検索結果が見つかりませんでした
              </Typography>
            )}
            {searchResults.map((article) => (
              <Box key={article.id} sx={{ mb: 2 }}>
                <ArticleCard
                  id={article.id}
                  url={article.url}
                  title={article.title}
                  status={article.status as ArticleStatus}
                  memo={article.memo ?? ""}
                  onDelete={handleDelete}
                  onSave={handleSave}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Modal>
    </>
  );
}