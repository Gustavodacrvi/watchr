export interface User {
  username: string;
  email: string;
  password: string;
  sessionToken: string;
  sessionTokenExpireDate: number;
}
