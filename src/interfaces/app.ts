
export interface PanGesture {
  icon: string
  iconColor: string
  distance: number
}

export interface ListIcon {
  icon: string
  iconColor: string
  size: string
  callback?: (...args: any) => void
  name?: string
}

export interface Perspective {
  smart: boolean
  binded: boolean
  showWhenNotEmpty: boolean
  showTaskNumber: boolean
  hasToBeEmpty: string[]
  name: string
  icon: string
  iconColor: string
  id: string
}

export interface Label {
  smart: boolean
  name: string
  subLabels: Label[]
  id: string
}
