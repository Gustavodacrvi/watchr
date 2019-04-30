export interface UserObj {
  username: string;
  email: string;
  password: string;
  sessionToken: string;
  sessionTokenExpireDate: number;
  save: Function;
  markModified: Function;
}

export type CallbackFunction = () => void;
