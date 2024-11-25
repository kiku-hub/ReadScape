import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../app/_components/LoadingSpinner';
import '@testing-library/jest-dom';

describe('LoadingSpinner', () => {
  it('メッセージなしで正しくレンダリングされること', () => {
    render(<LoadingSpinner />);
    
    // スピナーの各要素が存在することを確認
    expect(document.querySelector('.animate-spin-slow')).toBeInTheDocument();
    expect(document.querySelector('.animate-spin-reverse')).toBeInTheDocument();
    expect(document.querySelector('.animate-pulse-slow')).toBeInTheDocument();
  });

  it('メッセージ付きで正しくレンダリングされること', () => {
    const testMessage = 'テスト中...';
    render(<LoadingSpinner message={testMessage} />);
    
    // メッセージが表示されることを確認
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    
    // メッセージに正しいスタイルが適用されていることを確認
    const messageElement = screen.getByText(testMessage);
    expect(messageElement).toHaveClass('animate-fade-in');
    expect(messageElement).toHaveClass('text-green-five');
  });

  it('メッセージがない場合、メッセージ要素が表示されないこと', () => {
    const { container } = render(<LoadingSpinner />);
    
    // p要素（メッセージコンテナ）が存在しないことを確認
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('すべてのアニメーション要素が正しいクラスを持っていること', () => {
    const { container } = render(<LoadingSpinner />);
    
    // 外側のリング
    const outerRing = container.querySelector('.animate-spin-slow');
    expect(outerRing).toHaveClass('border-green-one/30');
    expect(outerRing).toHaveClass('h-20');
    expect(outerRing).toHaveClass('w-20');

    // 中間のリング
    const middleRing = container.querySelector('.animate-spin-reverse');
    expect(middleRing).toHaveClass('border-green-three/40');
    expect(middleRing).toHaveClass('h-14');
    expect(middleRing).toHaveClass('w-14');

    // 内側のリング
    const innerRing = container.querySelector('.animate-pulse-slow');
    expect(innerRing).toHaveClass('border-green-four/50');
    expect(innerRing).toHaveClass('h-8');
    expect(innerRing).toHaveClass('w-8');

    // 中心の点
    const centerDot = container.querySelector('.bg-green-five\\/60');
    expect(centerDot).toHaveClass('h-2');
    expect(centerDot).toHaveClass('w-2');
  });
});