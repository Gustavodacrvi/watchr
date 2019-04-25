export interface FormLogObject {
  name: string;
  value: any;
  error: boolean;
}

export interface InputErrorObject {
  name: string;
  msg: string;
}

export interface ToastObj {
  msg: string;
  duration_seconds: number | null;
  type: 'normal' | 'error' | 'success' | 'warning';
}
