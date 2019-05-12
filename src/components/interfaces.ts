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




export interface DateInterval {
  start: string;
  end: string;
}

export interface Routine {
  id: string;
  name: string;
  intervals: Array<{
    id: string, start: string, end: string,
  }>;
  visibilityField: Array<
    DateInterval |
    string // id for the calendar tag || ISO date
  >;
}
