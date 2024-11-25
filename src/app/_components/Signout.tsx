"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button, Avatar, Stack, Typography, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

// 型定義
type UserProfileProps = {
  user: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  };
};

// 公開ルートの型定義
type PublicRoute = "/login" | "/signup";

// 公開ルートの定義
const PUBLIC_ROUTES: readonly PublicRoute[] = ["/login", "/signup"] as const;

// 型ガード関数
const isPublicRoute = (path: string): path is PublicRoute => {
  return PUBLIC_ROUTES.includes(path as PublicRoute);
};

// スタイル定数
const COMMON_STYLES = {
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '20px',
  border: '1px solid transparent',
  transition: 'all 0.3s ease',
} as const;

const HOVER_STYLES = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(76, 175, 80, 0.2)',
  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
} as const;

// ユーザープロフィールコンポーネント
const UserProfile = ({ user }: UserProfileProps) => (
  <Tooltip title={user.email ?? ''}>
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      sx={{
        ...COMMON_STYLES,
        padding: '4px 12px',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
        '&:hover': {
          ...HOVER_STYLES,
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Avatar 
        src={user.image ?? ''} 
        alt={user.name ?? ''}
        sx={{ 
          width: { xs: 24, sm: 28 }, 
          height: { xs: 24, sm: 28 },
          border: '2px solid rgba(76, 175, 80, 0.3)'
        }}
      />
      <Typography 
        className="hidden sm:block"
        sx={{
          fontSize: { xs: '0.875rem', sm: '1.25rem' },
          fontWeight: 'bold',
          color: 'text.primary'
        }}
      >
        {user.name}
      </Typography>
    </Stack>
  </Tooltip>
);

// サインアウトボタンコンポーネント
const SignoutButton = () => (
  <Link href="/api/auth/signout" className="no-underline">
    <Button
      variant="contained"
      color="success"
      startIcon={<LogoutIcon />}
      size="small"
      sx={{
        ...COMMON_STYLES,
        padding: '4px 12px',
        fontSize: { xs: '0.875rem', sm: '1.25rem' },
        fontWeight: 'bold',
        minWidth: { xs: '32px', sm: 'auto' },
        height: { xs: '32px', sm: '36px' },
        color: 'text.primary',
        letterSpacing: 'normal',
        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
        '& .MuiButton-startIcon': {
          margin: { xs: '0', sm: '0 8px 0 0' },
          zIndex: 10,
        },
        '& .MuiSvgIcon-root': {
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          transition: 'transform 0.3s',
          zIndex: 10,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: '20px',
          background: 'linear-gradient(to right, rgba(76,175,80,0.05), transparent)',
          opacity: 0,
          transition: 'opacity 0.3s',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 0,
          height: '2px',
          background: '#4caf50',
          transition: 'all 0.3s',
          filter: 'blur(2px)',
        },
        '&:hover': {
          ...HOVER_STYLES,
          letterSpacing: '0.5px',
          '&::before': {
            opacity: 1,
          },
          '&::after': {
            width: '100%',
          },
          '& .MuiSvgIcon-root': {
            transform: 'scale(1.05)',
          },
        }
      }}
    >
      <span className="hidden sm:inline relative z-10">Sign Out</span>
      <span className="sm:hidden relative z-10">
        <LogoutIcon />
      </span>
    </Button>
  </Link>
);

// メインコンポーネント
export default function Signout() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // パスが存在しない場合は何も表示しない
  if (!pathname) return null;

  // 公開ルートまたは未認証の場合は何も表示しない
  if (isPublicRoute(pathname) || !session) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      <Stack direction="row" spacing={2} alignItems="center">
        <UserProfile user={session.user ?? {}} />
        <SignoutButton />
      </Stack>
    </div>
  );
}