import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthenticatedView from '@/app/_components/AuthenticatedView';
import { api } from '~/trpc/react';
import type { ArticleDetails } from '~/server/api/routers/article';

// モックの設定
jest.mock('~/trpc/react', () => ({
  api: {
    article: {
      save: {
        useMutation: jest.fn(),
      },
    },
  },
}));

// 子コンポーネントのモック
jest.mock('@/app/_components/UrlInput', () => {
  const MockUrlInput = ({ onUrlSubmit, onModalOpen }: { 
    onUrlSubmit: (details: ArticleDetails) => void;
    onModalOpen: () => void;
  }) => (
    <div>
      <button 
        onClick={() => {
          onUrlSubmit(mockArticleDetails);
          onModalOpen();
        }}
      >
        Add Article
      </button>
    </div>
  );
  MockUrlInput.displayName = 'UrlInput';
  return MockUrlInput;
});

jest.mock('@/app/_components/StatusTabs', () => {
  const MockStatusTabs = () => <div>Status Tabs</div>;
  MockStatusTabs.displayName = 'StatusTabs';
  return MockStatusTabs;
});

jest.mock('@/app/_components/Modal', () => {
  const MockModal = ({ 
    isOpen, 
    onClose, 
    articleDetails, 
    onSave 
  }: { 
    isOpen: boolean;
    onClose: () => void;
    articleDetails: ArticleDetails | null;
    onSave: (status: string, memo: string) => void;
  }) => (
    isOpen ? (
      <div role="dialog">
        <button onClick={() => onSave('WANT_TO_READ', 'Test memo')}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  );
  MockModal.displayName = 'Modal';
  return MockModal;
});

// テストデータ
const mockArticleDetails: ArticleDetails = {
  title: 'Test Article',
  url: 'https://example.com',
  thumbnail: 'https://example.com/image.jpg',
  description: 'Test description',
};

describe('AuthenticatedView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトのモック設定を追加
    (api.article.save.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  it('renders the component with UrlInput and StatusTabs', () => {
    render(<AuthenticatedView />);
    
    expect(screen.getByText('Add Article')).toBeInTheDocument();
    expect(screen.getByText('Status Tabs')).toBeInTheDocument();
  });

  it('opens modal when article is submitted', async () => {
    const mockMutate = jest.fn();
    (api.article.save.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });

    render(<AuthenticatedView />);
    
    const addButton = screen.getByText('Add Article');
    await userEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('saves article when save button is clicked in modal', async () => {
    const mockMutate = jest.fn();
    (api.article.save.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });

    render(<AuthenticatedView />);
    
    const addButton = screen.getByText('Add Article');
    await userEvent.click(addButton);

    const saveButton = screen.getByText('Save');
    await userEvent.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith({
      url: mockArticleDetails.url,
      status: 'WANT_TO_READ',
      memo: 'Test memo',
    });
  });

  it('closes modal when close button is clicked', async () => {
    const mockMutate = jest.fn();
    (api.article.save.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      error: null,
    });

    render(<AuthenticatedView />);
    
    const addButton = screen.getByText('Add Article');
    await userEvent.click(addButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const closeButton = screen.getByText('Close');
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});