
export interface VuexModule {
  state: {
    [key: string]: any,
  },
  mutations: {
    save: (...obj: any[]) => void
    getSavedData: (...obj: any[]) => void
    [key: string]: any,
  },
  getters: {
    [key: string]: any,
  },
  actions: {
    setDefaultData: (...obj: any[]) => void
    [key: string]: any,
  },
}

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
  callback: (input: string | null) => void
}

export interface FloatingButton {
  icon: string
  iconColor: string
  backColor: string
  click?: () => void
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
  parentId: string | null
  id: string
}
