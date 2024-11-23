"use client";

import dynamic from 'next/dynamic';
import { useState } from "react";
import { Box, TextField, Typography, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "~/trpc/react";
import ArticleCard from "./ArticleCard";
import { useDebounce } from "~/hooks/useDebounce";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  status: "WANT_TO_READ" | "IN_PROGRESS" | "COMPLETED";
  createdAt: Date;
  url: string;
  title: string | null;
  memo: string | null;
  description: string | null;
  image: string | null;
}

export default function SearchModal() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const utils = api.useContext();

  const { data: searchResults = [] } = api.article.searchArticles.useQuery<SearchResult[]>(
    { query: debouncedQuery.toLowerCase() },
    {
      enabled: debouncedQuery.length > 0 && open && !!session && pathname !== "/auth/signin",
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

  // 未認証またはログインページでは表示しない
  if (!session || pathname === "/auth/signin") {
    return null;
  }

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
        onClose={() => setOpen(false)}
        disableEscapeKeyDown
        aria-labelledby="search-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: { xs: '90%', sm: '600px', md: '800px' },
            maxHeight: '85vh',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            p: { xs: 2, sm: 4 },
            overflow: 'hidden',
            animation: 'modalFadeIn 0.3s ease-out',
            '@keyframes modalFadeIn': {
              from: {
                opacity: 0,
                transform: 'scale(0.95)',
              },
              to: {
                opacity: 1,
                transform: 'scale(1)',
              },
            },
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="タイトル、URL、メモで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    border: '2px solid rgba(76, 175, 80, 0.1)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    border: '2px solid rgba(76, 175, 80, 0.3)',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '12px 16px',
                  fontSize: '1rem',
                  '&::placeholder': {
                    color: 'rgba(0, 0, 0, 0.4)',
                    fontSize: '0.95rem',
                  },
                },
              }}
            />
            <IconButton 
              onClick={() => {
                setOpen(false);
                setSearchQuery("");
              }}
              sx={{
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                padding: '8px',
                '&:hover': {
                  color: 'text.primary',
                  transform: 'rotate(90deg)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box 
            sx={{ 
              mt: 2,
              maxHeight: 'calc(85vh - 140px)',
              overflow: 'auto',
              px: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#ddd',
                borderRadius: '4px',
                '&:hover': {
                  background: '#ccc',
                },
              },
            }}
          >
            {searchResults.length === 0 && searchQuery && (
              <Typography 
                color="text.secondary" 
                align="center"
                sx={{
                  py: 8,
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                検索結果が見つかりませんでした
              </Typography>
            )}
            {searchResults.map((article) => (
              <Box 
                key={article.id} 
                sx={{ 
                  mb: 2,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <ArticleCard
                  id={article.id}
                  url={article.url}
                  title={article.title ?? undefined}
                  description={article.description ?? undefined}
                  status={article.status}
                  image={article.image ?? undefined}
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