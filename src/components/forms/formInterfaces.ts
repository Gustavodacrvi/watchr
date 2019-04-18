export interface LogObject {
  name: string;
  value: any;
  error: boolean;
};

export interface ComponentComputed {
  logObject(): object;
  [key: string]: any;
};

export interface ComponentMethods {
  commitLog(): void;
  [key: string]: any;
};
