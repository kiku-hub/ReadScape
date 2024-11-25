import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UrlInput from '@/app/_components/UrlInput';
import { api } from '~/trpc/react';
import type { ArticleDetails } from '~/server/api/routers/article';

// エラーハンドラーの型定義
type MutationError = Error;

type MutationVariables = {
  url: string;
};

// モックの設定
jest.mock('~/trpc/react', () => ({
  api: {
    article: {
      getArticleDetails: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('UrlInput Component', () => {
  const mockOnUrlSubmit = jest.fn();
  const mockOnModalOpen = jest.fn();

  const mockArticleDetails: ArticleDetails = {
    title: 'Test Article',
    url: 'https://example.com/',
    thumbnail: 'https://example.com/image.jpg',
    description: 'Test description',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // デフォルトのモック設定
    (api.article.getArticleDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('正常なURLを入力して送信できる', async () => {
    const mockMutate = jest.fn().mockImplementation((data: MutationVariables) => {
      mockOnUrlSubmit(mockArticleDetails);
      mockOnModalOpen();
    });

    (api.article.getArticleDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<UrlInput onUrlSubmit={mockOnUrlSubmit} onModalOpen={mockOnModalOpen} />);

    const input = screen.getByPlaceholderText('記事のURLを入力してください');
    const submitButton = screen.getByLabelText('記事を追加');

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockMutate).toHaveBeenCalledWith({ url: 'https://example.com/' });
    expect(mockOnUrlSubmit).toHaveBeenCalledWith(mockArticleDetails);
    expect(mockOnModalOpen).toHaveBeenCalled();
  });

  test('無効なURLでエラーメッセージを表示する', async () => {
    render(<UrlInput onUrlSubmit={mockOnUrlSubmit} onModalOpen={mockOnModalOpen} />);

    const input = screen.getByPlaceholderText('記事のURLを入力してください');
    const submitButton = screen.getByLabelText('記事を追加');

    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('有効なURLを入力してください')).toBeInTheDocument();
  });

  test('APIエラー時にエラーメッセージを表示する', async () => {
    const errorMessage = 'エラーが発生しました';
    
    // onErrorハンドラーを実装
    const mockOnError = jest.fn((error: MutationError) => {
      // エラーメッセージを設定する処理をシミュレート
    });

    // mutateの実装を修正
    const mockMutate = jest.fn().mockRejectedValue(new Error(errorMessage));

    (api.article.getArticleDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      onError: mockOnError,
    });

    render(<UrlInput onUrlSubmit={mockOnUrlSubmit} onModalOpen={mockOnModalOpen} />);

    const input = screen.getByPlaceholderText('記事のURLを入力してください');
    const submitButton = screen.getByLabelText('記事を追加');

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // エラーメッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // エラーメッセージが消えることを確認
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });

  test('Enterキーで送信できる', async () => {
    const mockMutate = jest.fn().mockImplementation((data: MutationVariables) => {
      mockOnUrlSubmit(mockArticleDetails);
      mockOnModalOpen();
    });

    (api.article.getArticleDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<UrlInput onUrlSubmit={mockOnUrlSubmit} onModalOpen={mockOnModalOpen} />);

    const input = screen.getByPlaceholderText('記事のURLを入力してください');
    
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    await act(async () => {
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    });

    expect(mockMutate).toHaveBeenCalledWith({ url: 'https://example.com/' });
  });

  test('送信中は入力とボタンが無効になる', () => {
    (api.article.getArticleDetails.useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<UrlInput onUrlSubmit={mockOnUrlSubmit} onModalOpen={mockOnModalOpen} />);

    const input = screen.getByPlaceholderText('記事のURLを入力してください');
    const submitButton = screen.getByLabelText('記事を追加');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});