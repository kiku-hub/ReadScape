import Link from "next/link";
import Image from "next/image";
import { Button, Container, Paper, Typography, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

export default function UnauthenticatedView() {
  return (
    <div className="flex h-screen items-center justify-center bg-white overflow-hidden">
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          className="p-8"
          sx={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxHeight: '95vh',
            minWidth: '400px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem',
          }}
        >
          {/* タイトル */}
          <Typography 
            variant="h3"
            component="h1" 
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1a1a1a 30%, #43a047 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1,
              letterSpacing: '-0.5px',
            }}
          >
            Read<span style={{ color: '#43a047' }}>Scape</span>
          </Typography>

          {/* サブタイトル */}
          <Typography 
            variant="subtitle1" 
            sx={{
              mb: 4,
              color: 'rgba(0, 0, 0, 0.6)',
              fontStyle: 'italic',
              letterSpacing: '0.5px',
            }}
          >
            - Bookmark & Progress Management Tool for Tech Learners -
          </Typography>

          {/* ボタン */}
          <Link href="/api/auth/signin" className="no-underline">
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              sx={{
                backgroundColor: '#43a047',
                '&:hover': {
                  backgroundColor: '#2e7d32',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(67, 160, 71, 0.4)',
                },
                mb: 4,
                px: 4,
                py: 1.25,
                borderRadius: '28px',
                textTransform: 'none',
                fontSize: '1rem',
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 4px 15px rgba(67, 160, 71, 0.3)',
              }}
            >
              Get Started with Google Login
            </Button>
          </Link>

          {/* イラスト */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              width: '250px',
              height: '250px',
              marginTop: '1rem',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(67, 160, 71, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                borderRadius: '50%',
                animation: 'pulse 3s infinite',
              },
            }}
          >
            <Image
              src="/images/main-img.png"
              alt="Workspace illustration"
              width={220}
              height={220}
              className="transition-all duration-500 hover:scale-105"
              style={{
                filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))',
              }}
            />
          </Box>
        </Paper>
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}