import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '~/app/_components/Modal';
import '@testing-library/jest-dom';
import type { ArticleDetails } from '~/server/api/routers/article';

// モックの設定
const mockArticleDetails: ArticleDetails = {
  url: 'https://example.com',
  title: 'テスト記事タイトル',
  description: 'テスト記事の説明',
  thumbnail: 'https://example.com/thumbnail.jpg'
};


const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

// フェッチのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        title: 'テスト記事',
        image: 'https://example.com/image.jpg',
      }),
  })
) as jest.Mock;

describe('Modal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('モーダルが閉じている場合は何も表示されないこと', () => {
    render(
      <Modal
        isOpen={false}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('ステータス')).not.toBeInTheDocument();
  });

  it('モーダルが開いているときに記事情報が表示されること', async () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );

    // ローディング状態の確認
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    // 記事情報の表示を待つ
    await waitFor(() => {
      expect(screen.getByText('テスト記事')).toBeInTheDocument();
    });

    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('メモ')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれること', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByLabelText('閉じる');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('フォームの入力が正しく動作すること', async () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );

    // 記事情報の読み込みを待つ
    await waitFor(() => {
      expect(screen.getByText('テスト記事')).toBeInTheDocument();
    });

    // ステータスの変更
    const statusSelect = screen.getByRole('combobox');
    await userEvent.selectOptions(statusSelect, 'COMPLETED');
    expect(statusSelect).toHaveValue('COMPLETED');

    // メモの入力
    const memoTextarea = screen.getByRole('textbox');
    await userEvent.type(memoTextarea, 'テストメモ');
    expect(memoTextarea).toHaveValue('テストメモ');
  });

  it('保存ボタンをクリックするとonSaveが呼ばれること', async () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );

    // 記事情報の読み込みを待つ
    await waitFor(() => {
      expect(screen.getByText('テスト記事')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('保存');
    await userEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('WANT_TO_READ', '');
  });

  it('APIエラー時にエラーハンドリングが正しく動作すること', async () => {
    // コンソールエラーのモック
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // フェッチのエラーモック
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={mockArticleDetails}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        '記事情報の取得に失敗しました:',
        'API Error'
      );
    });

    consoleSpy.mockRestore();
  });

  it('articleDetailsがnullの場合にエラーメッセージが表示されること', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        articleDetails={null}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('データが見つかりません')).toBeInTheDocument();
  });
});