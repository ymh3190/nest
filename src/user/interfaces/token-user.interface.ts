export interface TokenUser {
  user: {
    id: number;
    email: string;
  };
  refreshToken?: string;
}
