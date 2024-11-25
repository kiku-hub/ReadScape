import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import type { NextRouter } from 'next/router';
import type { ImageProps } from 'next/image';
import React from 'react';

// グローバル型の拡張
export interface Global {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof TextDecoder;
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

// グローバル変数の設定
(global as unknown as Global).TextEncoder = TextEncoder;
(global as unknown as Global).TextDecoder = TextDecoder;

// Mock next/router
const useRouter = jest.fn();

const mockRouter: Partial<NextRouter> = {
  route: '/',
  pathname: '',
  query: {},
  asPath: '',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
};

useRouter.mockImplementation(() => mockRouter);

jest.mock('next/router', () => ({
  useRouter,
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({ src, alt, ...props }: ImageProps) {
    const imgSrc = typeof src === 'string' 
      ? src 
      : typeof src === 'object' && 'default' in src
        ? src.default
        : typeof src === 'object' && 'src' in src
          ? src.src
          : '';

    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', {
      ...props,
      src: imgSrc,
      alt: alt || '',
    });
  },
}));

// グローバルなフェッチのモック
interface MockResponse {
  json: () => Promise<unknown>;
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
}

const mockFetch = jest.fn().mockImplementation(
  (): Promise<MockResponse> =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
    })
);

(global as unknown as Global).fetch = mockFetch;

// コンソールエラーの抑制
const originalError = console.error.bind(console);
beforeAll(() => {
  console.error = (...args: unknown[]): void => {
    if (typeof args[0] === 'string' && /Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});