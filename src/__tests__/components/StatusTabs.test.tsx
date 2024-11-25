import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StatusTabs from '@/app/_components/StatusTabs';
import { api } from '~/trpc/react';
import '@testing-library/jest-dom';
import type { ArticleStatus } from '~/server/api/routers/article';

// LoadingSpinnerのモック
jest.mock('@/app/_components/LoadingSpinner', () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => <div data-testid="loading-spinner">{message}</div>,
}));

// ArticleCardのモック
jest.mock('@/app/_components/ArticleCard', () => ({
  ArticleCard: ({ title }: { title: string }) => <div>{title}</div>,
}));

// モックセッションの設定
const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '1',
};

// APIモックの設定
jest.mock('~/trpc/react', () => ({
  api: {
    article: {
      getArticlesByStatus: {
        useQuery: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
    useContext: jest.fn(),
  },
}));

// next-authのモック
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: mockSession,
    status: 'authenticated',
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('StatusTabs', () => {
  const mockArticles = [
    {
      id: '1',
      url: 'https://example.com',
      title: 'Test Article',
      description: 'Test description',
      image: 'https://example.com/image.jpg',
      memo: 'Test memo',
      status: 'WANT_TO_READ' as ArticleStatus,
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトのモック実装
    (api.article.getArticlesByStatus.useQuery as jest.Mock).mockReturnValue({
      data: mockArticles,
      isLoading: false,
      error: null,
      enabled: true,
      retry: false,
      staleTime: 60000,
    });

    (api.article.update.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });

    (api.article.delete.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });

    (api.useContext as jest.Mock).mockReturnValue({
      article: {
        getArticlesByStatus: {
          invalidate: jest.fn().mockResolvedValue(undefined),
        },
      },
    });
  });

  it('renders all tabs correctly', () => {
    render(<StatusTabs />);

    expect(screen.getByText('未読')).toBeInTheDocument();
    expect(screen.getByText('読書中')).toBeInTheDocument();
    expect(screen.getByText('読了')).toBeInTheDocument();
    expect(screen.getByText('全記事')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (api.article.getArticlesByStatus.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<StatusTabs />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    const errorMessage = 'Test error';
    (api.article.getArticlesByStatus.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error(errorMessage),
    });

    render(<StatusTabs />);
    expect(screen.getByText(`エラーが発生しました: ${errorMessage}`)).toBeInTheDocument();
  });

  it('shows no articles message when empty', () => {
    (api.article.getArticlesByStatus.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<StatusTabs />);
    expect(screen.getByText('未読の記事がありません')).toBeInTheDocument();
  });

  it('renders articles and handles tab change', async () => {
    render(<StatusTabs />);

    expect(screen.getByText('Test Article')).toBeInTheDocument();

    fireEvent.click(screen.getByText('読書中'));
    await waitFor(() => {
      expect(api.article.getArticlesByStatus.useQuery).toHaveBeenCalledWith(
        { status: 'IN_PROGRESS' },
        expect.any(Object)
      );
    });
  });
});