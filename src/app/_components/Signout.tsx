"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Signout() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute || !session) {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
      <Link href="/api/auth/signout" className="no-underline">
        <Button
          variant="contained"
          color="success"
          startIcon={<LogoutIcon />}
          size="small"
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
            padding: '4px 12px',
            fontSize: { xs: '0.875rem', sm: '1.25rem' }, // Logoと同じサイズに
            fontWeight: 'bold', // Logoと同じ太さに
            backgroundColor: '#4caf50',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
            border: '1px solid transparent',
            minWidth: { xs: '32px', sm: 'auto' },
            height: { xs: '32px', sm: '36px' },
            background: 'rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            color: 'text.primary',
            '& .MuiButton-startIcon': {
              margin: { xs: '0', sm: '0 8px 0 0' },
              color: 'text.primary',
            },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1.1rem', sm: '1.5rem' }, // アイコンサイズも調整
              zIndex: 10,
              transition: 'transform 0.3s ease',
              color: 'text.primary',
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
              transform: { xs: 'scale(1.05)', sm: 'translateY(-2px)' },
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              letterSpacing: '0.5px',
              color: 'text.primary',
              '&::before': {
                opacity: 1,
              },
              '&::after': {
                width: '100%',
              },
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.05)',
                color: 'text.primary',
              },
            },
            '&:active': {
              transform: 'translateY(1px)',
              boxShadow: '0 2px 4px rgba(76, 175, 80, 0.2)',
            },
            '@media (max-width: 640px)': {
              minWidth: '32px',
              padding: '4px',
            },
          }}
        >
          <span className="hidden sm:inline relative z-10">Sign Out</span>
          <span className="sm:hidden relative z-10">
            <LogoutIcon />
          </span>
        </Button>
      </Link>
    </div>
  );
}