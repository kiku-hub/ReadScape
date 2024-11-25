import { useState, useEffect } from 'react';

/**
 * 指定された値に対してデバウンス処理を行うカスタムフック
 * @template T - デバウンス対象の値の型
 * @param value - デバウンス対象の値
 * @param delay - デバウンスする時間（ミリ秒）
 * @returns デバウンスされた値
 */
export function useDebounce<T>(value: T, delay: number): T {
  // デバウンスされた値を管理するstate
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // タイマーIDを保持するための変数
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // クリーンアップ関数：コンポーネントのアンマウント時やvalue/delayの変更時に実行
    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]); // 依存配列：value または delay が変更された時のみ実行

  return debouncedValue;
}