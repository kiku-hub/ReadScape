import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';
import type { NextRouter } from 'next/router';
import type { ImageProps } from 'next/image';
import type { QueryClient as QueryClientType } from '@tanstack/react-query';
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

// next-auth/react のモック設定
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: '1',
        email: null,
        name: null,
        image: null,
      },
      expires: '1',
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// tRPCの型定義
interface Article {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  memo: string | null;
  status: 'WANT_TO_READ' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
}

type MutationParams = {
  id: string;
  memo?: string;
  status?: Article['status'];
};

type TRPCMutationResult = {
  mutate: jest.Mock<Promise<void>, [MutationParams]>;
  isPending: boolean;
};

type TRPCMutation = jest.Mock<TRPCMutationResult, []>;

type TRPCQueryResult<T> = {
  data?: T;
  isLoading: boolean;
  error: Error | null;
};

type TRPCQuery<T> = jest.Mock<TRPCQueryResult<T>, []>;

interface TRPCApi {
  api: {
    article: {
      getArticleDetails: {
        useMutation: TRPCMutation;
      };
      getArticlesByStatus: {
        useQuery: TRPCQuery<Article[]>;
      };
      update: {
        useMutation: TRPCMutation;
      };
      delete: {
        useMutation: TRPCMutation;
      };
    };
    useContext: jest.Mock<{
      article: {
        getArticlesByStatus: {
          invalidate: () => Promise<void>;
        };
      };
    }, []>;
  };
}

// tRPCのモックヘルパー関数
const createMockMutation = (): TRPCMutation => {
  const mockMutate = jest.fn<Promise<void>, [MutationParams]>()
    .mockImplementation((params: MutationParams) => Promise.resolve());

  const mutationResult: TRPCMutationResult = {
    mutate: mockMutate,
    isPending: false
  };

  const mutation: TRPCMutation = 
    jest.fn<TRPCMutationResult, []>().mockReturnValue(mutationResult);

  return mutation;
};

const createMockQuery = <T>(): TRPCQuery<T> => {
  const queryResult: TRPCQueryResult<T> = {
    data: undefined,
    isLoading: false,
    error: null
  };

  const query: TRPCQuery<T> = 
    jest.fn<TRPCQueryResult<T>, []>().mockReturnValue(queryResult);

  return query;
};

// tRPCのモック
jest.mock('~/trpc/react', () => {
  const api: TRPCApi = {
    api: {
      article: {
        getArticleDetails: {
          useMutation: createMockMutation(),
        },
        getArticlesByStatus: {
          useQuery: createMockQuery<Article[]>(),
        },
        update: {
          useMutation: createMockMutation(),
        },
        delete: {
          useMutation: createMockMutation(),
        },
      },
      useContext: jest.fn(() => ({
        article: {
          getArticlesByStatus: {
            invalidate: jest.fn().mockResolvedValue(undefined),
          },
        },
      })),
    },
  };
  return api;
});

// QueryClientのモック
jest.mock('@tanstack/react-query', () => {
  const actual: typeof import('@tanstack/react-query') = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    QueryClient: jest.fn().mockImplementation((): Pick<QueryClientType, 'setDefaultOptions'> => ({
      setDefaultOptions: jest.fn(() => undefined),
    })),
  };
});

// Next.js Routerのモック
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

// Next.js Imageのモック
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