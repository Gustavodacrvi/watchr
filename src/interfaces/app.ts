
export interface Alert {
  name: string
  duration: number | null
  type: 'error' | 'normal' | 'success' | 'warning'
  btn?: string
  callback?: () => void
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
  id: string
}

export interface SmartPerspective {
  userId: string
  name: string
  id: string
  icon: string
  iconColor: string
  pin: boolean
  numberOfTasks: boolean
  description: string
  order: string[]
  smartPerspective: boolean,
  excludeSmartLabels: string[]
  includeSmartLabels: string[]
  excludeCustomLabels: string[]
  includeCustomLabels: string[]
}

export interface ListIcon {
  icon: string
  iconColor: string
  size: string
  name?: string
  callback?: (...arr: any[]) => void
}
