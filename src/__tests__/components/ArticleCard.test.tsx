import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArticleCard } from '../../app/_components/ArticleCard';
import '@testing-library/jest-dom';

describe('ArticleCard', () => {
  const mockProps = {
    id: '1',
    url: 'https://example.com',
    title: 'テスト記事',
    description: 'テストの説明',
    status: 'WANT_TO_READ' as const,
    image: 'https://example.com/image.jpg',
    memo: 'テストメモ',
    onDelete: jest.fn(),
    onSave: jest.fn(),
    onMetadataUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('基本的なレンダリングが正しく行われること', () => {
    render(<ArticleCard {...mockProps} />);
    
    expect(screen.getByText('テスト記事')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('メモを入力...')).toHaveValue('テストメモ');
    expect(screen.getByText('未読')).toBeInTheDocument();
  });

  it('メモを更新できること', async () => {
    render(<ArticleCard {...mockProps} />);
    
    const memoInput = screen.getByPlaceholderText('メモを入力...');
    fireEvent.change(memoInput, { target: { value: '新しいメモ' } });
    
    const saveButton = screen.getByText('保存');
    expect(saveButton).toBeEnabled();
    
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith('1', '新しいメモ', 'WANT_TO_READ');
    });
  });

  it('ステータスを更新できること', async () => {
    render(<ArticleCard {...mockProps} />);
    
    const statusSelect = screen.getByLabelText('記事のステータス');
    fireEvent.change(statusSelect, { target: { value: '読了' } });
    
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith('1', 'テストメモ', 'COMPLETED');
    });
  });

  it('削除ボタンをクリックすると削除処理が実行されること', async () => {
    render(<ArticleCard {...mockProps} />);
    
    const deleteButton = screen.getByLabelText('記事を削除');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(mockProps.onDelete).toHaveBeenCalledWith('1');
    });
  });
});