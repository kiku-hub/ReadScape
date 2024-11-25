import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../app/_components/Pagination';
import '@testing-library/jest-dom';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1ページのみの場合は何も表示されないこと', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('基本的なページネーションが正しく表示されること', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />
    );

    // ページ番号が正しく表示されていることを確認
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // 前へ/次へボタンが存在することを確認
    expect(screen.getByText('前へ')).toBeInTheDocument();
    expect(screen.getByText('次へ')).toBeInTheDocument();
  });

  it('現在のページが正しくアクティブ表示されること', () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />
    );
  
    const page2Button = screen.getByText('2');
    // ボタン自体にクラスが適用されている場合
    expect(page2Button).toHaveClass('bg-blue-500');
    expect(page2Button).toHaveClass('text-white');
    
    // または、別の要素を探す必要がある場合
    const activeButton = screen.getByRole('button', { name: '2' });
    expect(activeButton).toHaveClass('bg-blue-500');
  });

  it('前へ/次へボタンが適切に無効化されること', () => {
    // 最初のページの場合
    const { unmount } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />
    );
    expect(screen.getByText('前へ')).toBeDisabled();
    expect(screen.getByText('次へ')).not.toBeDisabled();

    // 最初のレンダリングをクリーンアップ
    unmount();

    // 最後のページの場合
    render(
      <Pagination currentPage={3} totalPages={3} onPageChange={mockOnPageChange} />
    );
    expect(screen.getByText('前へ')).not.toBeDisabled();
    expect(screen.getByText('次へ')).toBeDisabled();
  });

  it('ページ番号をクリックすると正しくコールバックが呼ばれること', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByText('2'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('前へ/次へボタンをクリックすると正しくコールバックが呼ばれること', () => {
    render(
      <Pagination currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByText('前へ'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('次へ'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('多数のページがある場合に省略記号が正しく表示されること', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
    );

    // 省略記号が表示されることを確認
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2);

    // 必要なページ番号が表示されていることを確認
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('calculatePageNumbersが正しく動作すること', () => {
    // 中間ページの場合
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
    );
    
    // 最初のページ、現在のページの前後、最後のページが表示されることを確認
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});