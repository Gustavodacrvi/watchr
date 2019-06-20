
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
