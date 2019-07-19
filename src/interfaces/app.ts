
export interface Alert {
  name: string
  duration: number | null
  type: 'error' | 'normal' | 'success' | 'warning'
  btn?: string
  callback?: () => void
}

export interface ListElement {
  show: boolean
  number: number
  [key: string]: any
}

export interface SimpleAdder {
  popUpTitle: string
  buttonName: string
  inputPlaceholder: string
  inputMaximumCharacters: number
  callback: (input: string) => void
}

export interface FloatingButton {
  icon: string
  iconColor: string
  backColor: string
  click?: () => void
}

export interface Label {
  userId: string
  name: string
  order: string[]
  id: string
}

export interface Perspective {
  userId: string
  name: string
  id: string
  icon: string
  iconColor: string
  description: string
  order: string[]
  isSmart: boolean,
  priority: 'Low priority' | 'High priority' | 'Medium priority' | ''
  pin: boolean
  numberOfTasks: boolean
  showWhenNotEmpty: boolean
  excludeLabels: string[]
  includeAndLabels: string[]
  includeOrLabels: string[]
}

export interface ListIcon {
  icon: string
  iconColor: string
  size: string
  name?: string
  callback?: (...arr: any[]) => void
}

export interface Task {
  userId: string
  id: string
  name: string
  priority: 'Low priority' | 'High priority' | 'Medium priority' | ''
  labels: string[]
}
