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

export interface ISOdate {
  type: 'ISOdate',
  date: string,
}

export interface Routine {
  id: string;
  name: string;
  creationDate?: string;
  intervals: Array<{
    id: string, start: string, end: string,
  }>;
  visibilityField?: Array<
    DateInterval |
    ISOdate
  >;
}

export interface Label {
  id: string;
  name: string;
}

export interface Interval {
  id: string;
  name: string;
  color: string; // hex
  tasks: string[];
  tags: Label[];
}
