import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Signout from '@/app/_components/Signout';

// モックの設定
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  const MockLink = ({ children }: { children: React.ReactNode }) => children;
  MockLink.displayName = 'Link';
  return MockLink;
});

// Material-UIコンポーネントのモック
jest.mock('@mui/material', () => {
  const MockButton = ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  );
  MockButton.displayName = 'Button';

  const MockAvatar = ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  );
  MockAvatar.displayName = 'Avatar';

  const MockStack = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  MockStack.displayName = 'Stack';

  const MockTypography = ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  );
  MockTypography.displayName = 'Typography';

  const MockTooltip = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div title={title}>{children}</div>
  );
  MockTooltip.displayName = 'Tooltip';

  return {
    Button: MockButton,
    Avatar: MockAvatar,
    Stack: MockStack,
    Typography: MockTypography,
    Tooltip: MockTooltip,
  };
});

// LogoutIconのモック
jest.mock('@mui/icons-material/Logout', () => {
  const MockLogoutIcon = () => <span>LogoutIcon</span>;
  MockLogoutIcon.displayName = 'LogoutIcon';
  return MockLogoutIcon;
});

describe('Signout Component', () => {
  const mockSession = {
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when pathname is not available', () => {
    (usePathname as jest.Mock).mockReturnValue(null);
    (useSession as jest.Mock).mockReturnValue(mockSession);

    render(<Signout />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders nothing on public routes', () => {
    (usePathname as jest.Mock).mockReturnValue('/login');
    (useSession as jest.Mock).mockReturnValue(mockSession);

    render(<Signout />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders nothing when user is not authenticated', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });

    render(<Signout />);
    
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders user profile and signout button when authenticated on private route', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSession as jest.Mock).mockReturnValue(mockSession);

    render(<Signout />);
    
    // ユーザープロフィールの確認
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByAltText('Test User')).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    
    // ツールチップの確認
    expect(screen.getByTitle('test@example.com')).toBeInTheDocument();

    // サインアウトボタンの確認
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders mobile version correctly', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useSession as jest.Mock).mockReturnValue(mockSession);

    // モバイル表示のテスト
    Object.defineProperty(window, 'innerWidth', { value: 500 });
    window.dispatchEvent(new Event('resize'));

    render(<Signout />);
    
    // モバイル表示でのアイコンの確認
    expect(screen.getByText('LogoutIcon')).toBeInTheDocument();
  });
});