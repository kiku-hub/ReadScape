import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '~/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('初期値が即座に返される', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('遅延時間内の値の変更は反映されない', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // 値を変更
    rerender({ value: 'changed', delay: 500 });

    // タイマーが発火する前は古い値のまま
    expect(result.current).toBe('initial');
  });

  it('遅延時間後に新しい値が反映される', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // 値を変更
    rerender({ value: 'changed', delay: 500 });

    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 新しい値が反映される
    expect(result.current).toBe('changed');
  });

  it('遅延時間内に複数回値が変更された場合、最後の値のみが反映される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // 複数回値を変更
    rerender({ value: 'first change', delay: 500 });
    rerender({ value: 'second change', delay: 500 });
    rerender({ value: 'final change', delay: 500 });

    // タイマーを進める前は古い値のまま
    expect(result.current).toBe('initial');

    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 最後の値のみが反映される
    expect(result.current).toBe('final change');
  });

  it('delay値が変更された場合も正しく動作する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // delay値を変更
    rerender({ value: 'changed', delay: 1000 });

    // 500ms経過時点ではまだ変更されていない
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // 1000ms経過時点で変更される
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('changed');
  });

  it('コンポーネントのアンマウント時にタイマーがクリアされる', () => {
    const { unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // コンポーネントをアンマウント
    unmount();

    // タイマーが正しくクリアされていることを確認
    expect(jest.getTimerCount()).toBe(0);
  });
});