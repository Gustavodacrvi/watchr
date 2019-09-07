
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
  icon?: string
  iconColor?: string
  progress?: number
  [key: string]: any
}

export interface AppnavDivisionEl {
  name: string
  id: string
  list: ListElement[]
}

export interface SimpleAdder {
  popUpTitle: string
  buttonName: string
  inputPlaceholder: string
  inputMaximumCharacters: number
  callback: (input: string) => void
}

export interface CenteredCard {
  type: 'ListIcons' | 'Component',
  flexBasis: string,
  listIcons: ListIcon[],
  listIconHandler: (...arr: any[]) => any
  compName: string
  search?: boolean
  maxHeight?: string
  payload?: any
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
  alwaysShowTaskLabels: boolean
  alwaysShowLastEditDate: boolean
  alwaysShowCreationDate: boolean
  sort: string[]
  excludeSmartPers: string[]
  includeAndSmartPers: string[]
  includeOrSmartPers: string[]
  excludeCustomPers: string[]
  includeAndCustomPers: string[]
  includeOrCustomPers: string[]
  excludeLabels: string[]
  includeAndLabels: string[]
  includeOrLabels: string[]
  excludeDates: string[]
  includeAndDates: string[]
  includeOrDates: string[]
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
  date: string | null
  time: string | null
  creationDate: string
  lastEditDate: string
  checklistOrder: string[]
  projectId: string
  completed: boolean
  checklist: Array<{
    completed: boolean,
    name: string,
    id: string,
    taskId: string,
  }>
}

export interface Heading {
  name: string
  id: string
  tasks: string[]
}

export interface Folder {
  userId: string
  id: string
  name: string
  projects: string[] // project ids
}

export interface Project {
  userId: string
  id: string
  name: string
  description: string
  creationDate: string
  lastEditDate: string
  bindOnOverview: boolean
  folderId: string
  tasks: string[]
  headings: Heading[]
}

export interface TaskInputObj {
  day: number
  month: number
  year: number
  time: string | null
}
