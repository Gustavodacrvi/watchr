export interface LogObject {
  name: string;
  value: any;
  error: boolean;
}

export interface ErrorObject {
  name: string;
  msg: string;
}

export interface ToastObj {
  msg: string;
  duration_seconds: number | null;
  type: 'normal' | 'error' | 'success';
}
