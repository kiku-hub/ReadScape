import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { type ComponentType } from 'react';
import { api } from '~/trpc/react';
import SearchModal from '~/app/_components/SearchModal';

// ArticleCardのモック
jest.mock('~/app/_components/ArticleCard', () => {
  return {
    __esModule: true,
    default: ({ title, status, url }: { title?: string; status: string; url: string }) => (
      <div data-testid="article-card">
        <div>{title}</div>
        <div>{status}</div>
        <div>{url}</div>
      </div>
    ),
  };
});

// MUIのダイナミックインポートをモック
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: <T extends { default: ComponentType<object> }>(fn: () => Promise<T>) => {
    let Component: ComponentType<object> | null = null;
    void fn().then((mod) => {
      Component = mod.default;
    });
    return function DynamicComponent(props: JSX.IntrinsicAttributes & object) {
      if (!Component) return null;
      return <Component {...props} />;
    };
  },
}));

// 他のモック
jest.mock('next-auth/react');
jest.mock('next/navigation');
jest.mock('~/trpc/react', () => ({
  api: {
    useContext: jest.fn(),
    article: {
      searchArticles: {
        useQuery: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('SearchModal', () => {
  beforeEach(() => {
    // セッションのモックをリセット
    (useSession as jest.Mock).mockReset();
    (usePathname as jest.Mock).mockReset();
    
    // デフォルトのモック値を設定
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1', name: 'Test User' } },
      status: 'authenticated'
    });
    (usePathname as jest.Mock).mockReturnValue('/');

    const mockUtils = {
      article: {
        searchArticles: {
          invalidate: jest.fn(),
        },
      },
    };

    (api.useContext as jest.Mock).mockReturnValue(mockUtils);
    (api.article.searchArticles.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (api.article.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });
    (api.article.update.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });
  });

  it('認証済みユーザーに検索ボタンが表示される', () => {
    render(<SearchModal />);
    expect(screen.getByRole('button', { name: /記事を検索/i })).toBeInTheDocument();
  });

  it('未認証ユーザーには検索ボタンが表示されない', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    });
    render(<SearchModal />);
    expect(screen.queryByRole('button', { name: /記事を検索/i })).not.toBeInTheDocument();
  });

  it('検索ボタンクリックでモーダルが開く', async () => {
    render(<SearchModal />);
    fireEvent.click(screen.getByRole('button', { name: /記事を検索/i }));
    expect(screen.getByPlaceholderText('タイトル、URL、メモで検索...')).toBeInTheDocument();
  });

  it('検索結果が表示される', async () => {
    const mockArticle = {
      id: '1',
      title: 'Test Article',
      url: 'https://example.com',
      status: 'UNREAD' as const,
      createdAt: new Date(),
      memo: null,
      description: null,
      image: null,
    };

    (api.article.searchArticles.useQuery as jest.Mock).mockReturnValue({
      data: [mockArticle],
      isLoading: false,
    });

    render(<SearchModal />);
    
    fireEvent.click(screen.getByRole('button', { name: /記事を検索/i }));
    const searchInput = screen.getByPlaceholderText('タイトル、URL、メモで検索...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByTestId('article-card')).toBeInTheDocument();
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
  });

  it('検索結果が0件の場合、メッセージが表示される', async () => {
    (api.article.searchArticles.useQuery as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<SearchModal />);
    
    fireEvent.click(screen.getByRole('button', { name: /記事を検索/i }));
    const searchInput = screen.getByPlaceholderText('タイトル、URL、メモで検索...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('閉じるボタンでモーダルが閉じる', async () => {
    render(<SearchModal />);
    
    fireEvent.click(screen.getByRole('button', { name: /記事を検索/i }));
    const closeButton = screen.getByRole('button', { name: /モーダルを閉じる/i });  // nameを日本語に変更
    fireEvent.click(closeButton);
  
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('タイトル、URL、メモで検索...')).not.toBeInTheDocument();
    });
  });
});