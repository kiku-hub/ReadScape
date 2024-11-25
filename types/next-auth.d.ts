import 'next-auth';

declare module 'next-auth' {
  /**
   * next-authのSession型を拡張
   */
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    expires: string;
  }

  /**
   * next-authのUser型を拡張
   */
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}