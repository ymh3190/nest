export interface TokenUser {
  user: {
    id: number;
    email: string;
    role: 'user' | 'admin';
  };
  refreshToken?: string;
}
