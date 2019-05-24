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
  type: 'DateInterval';
  start: Date;
  end: Date;
}

export interface Routine {
  id: string;
  name: string;
  creationDate?: Date;
  intervals: Array<{
    id: string, start: string, end: string,
  }>;
  visibilityField?: Array<
    DateInterval |
    Date
  >;
}

export interface Tag {
  type: 'Label' | 'Calendar';
  id: string;
  name: string;
  subLabels?: Tag[];
}

export interface Interval {
  id: string;
  name: string;
  color: string; // hex
  tasks: string[];
  tags: Tag[];
}
