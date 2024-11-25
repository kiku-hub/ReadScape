import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Logo from '~/app/_components/Logo';
import type { Session } from 'next-auth';

// next-auth/reactのモック
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// next/navigationのモック
jest.mock('next/navigation');
const mockUsePathname = usePathname as jest.MockedFunction<() => string | null>;

// next/linkのモック
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'Link';
  return MockLink;
});

// 認証済みセッションのモックデータ
const authenticatedSession: Session = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    image: '',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe('Logo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('パスが存在しない場合は何も表示されないこと', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue(null);

    render(<Logo />);
    
    expect(screen.queryByText('Read')).not.toBeInTheDocument();
    expect(screen.queryByText('Scape')).not.toBeInTheDocument();
  });

  it('未認証の場合は何も表示されないこと', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');

    render(<Logo />);
    
    expect(screen.queryByText('Read')).not.toBeInTheDocument();
    expect(screen.queryByText('Scape')).not.toBeInTheDocument();
  });

  it('公開ルート(/login)では何も表示されないこと', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/login');

    render(<Logo />);
    
    expect(screen.queryByText('Read')).not.toBeInTheDocument();
    expect(screen.queryByText('Scape')).not.toBeInTheDocument();
  });

  it('公開ルート(/signup)では何も表示されないこと', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/signup');

    render(<Logo />);
    
    expect(screen.queryByText('Read')).not.toBeInTheDocument();
    expect(screen.queryByText('Scape')).not.toBeInTheDocument();
  });

  it('認証済みで非公開ルートの場合はロゴが表示されること', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');

    render(<Logo />);
    
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Scape')).toBeInTheDocument();
  });

  it('ロゴがホームページへのリンクとして機能すること', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');

    render(<Logo />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('ロゴが適切なスタイリングを持つこと', () => {
    mockUseSession.mockReturnValue({
      data: authenticatedSession,
      status: 'authenticated',
      update: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');

    render(<Logo />);
    
    const container = screen.getByRole('heading').parentElement?.parentElement;
    expect(container).toHaveClass('fixed top-2 left-2 sm:top-4 sm:left-4 z-50');
    
    const readText = screen.getByText('Read');
    expect(readText).toHaveClass('text-[#4caf50]');
  });
});