
/* tslint:disable:max-line-length */

import { Task } from '../app'
import { State as RootState } from '@/interfaces/store'

export namespace TaskState {
  export type tasks = Task[]
}

export interface State {
  tasks: TaskState.tasks
}

export namespace TaskGetters {
  export type InboxTasks = Task[]
  export type GetNumberOfTasksByLabel = (labelId: string) => number
  export type GetTasksByIds = (ids: string[]) => Task[]
}

export interface Getters {
  inboxTasks: (state: State) => TaskGetters.InboxTasks
  getNumberOfTasksByLabel: (state: State) => TaskGetters.GetNumberOfTasksByLabel
  getTasksByIds: (state: State) => TaskGetters.GetTasksByIds
}

export interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export interface UtcObj {
  time: string
  date: string
}

export namespace TaskActions {
  export type StoreGetData = (context: ActionContext) => void
  export type GetData = () => void

  export type StoreUpdateTask = (context: ActionContext, obj: {name: string, priority: string, id: string, projectId: string, labels: [], utc: UtcObj | null}) => void
  export type UpdateTask = (obj: {name: string, projectId: string, priority: string, id: string, labels: [], utc: UtcObj | null}) => void

  export type StoreCopyTask = (context: ActionContext, taskId: string) => void
  export type CopyTask = (taskId: string) => void

  export type StoreAddTaskPerspective = (context: ActionContext, obj: {task: Task, perspectiveId: string, position: number, order: string[], utc: UtcObj | null}) => void
  export type AddTaskPerspective = (obj: {task: Task, perspectiveId: string, position: number, order: string[], utc: UtcObj | null}) => void

  export type StoreAddTaskLabel = (context: ActionContext, obj: {task: Task, labelId: string, position: number, order: string[], projectId: string, utc: UtcObj | null}) => void
  export type AddTaskLabel = (obj: {task: Task, labelId: string, projectId: string, position: number, order: string[], utc: UtcObj | null}) => void

  export type StoreAddTask = (context: ActionContext, obj: {name: string, priority: string, labels: string[], projectId: string, utc: UtcObj | null}) => void
  export type AddTask = (obj: {name: string, priority: string, projectId: string, labels: string[], utc: UtcObj | null}) => void

  export type StoreDeleteTasksById = (context: ActionContext, ids: string[]) => void
  export type DeleteTasksById = (ids: string[]) => void

  export type StoreAddMultipleLabelsToMultipleTasks = (context: ActionContext, obj: {taskIds: string[], labIds: string[]}) => void
  export type AddMultipleLabelsToMultipleTasks = (obj: {taskIds: string[], labIds: string[]}) => void

  export type StoreChangePrioritysByIds = (context: ActionContext, obj: {ids: string[], priority: string}) => void
  export type ChangePrioritysByIds = (obj: {ids: string[], priority: string}) => void

  export type StoreAddSubTask = (context: ActionContext, obj: {name: string, taskId: string, position: number, order: string[]}) => void
  export type AddSubTask = (obj: {name: string, taskId: string, position: number, order: string[]}) => void

  export type StoreSaveSubTask = (context: ActionContext, obj: {name: string, taskId: string, completed: boolean, id: string}) => void
  export type SaveSubTask = (obj: {name: string, taskId: string, completed: boolean, id: string}) => void

  export type StoreSaveSubtaskOrder = (context: ActionContext, obj: {taskId: string, order: string[]}) => void
  export type SaveSubtaskOrder = (obj: {taskId: string, order: string[]}) => void

  export type StoreDeleteSubTaskFromTask = (context: ActionContext, obj: {taskId: string, id: string}) => void
  export type DeleteSubTaskFromTask = (obj: {taskId: string, id: string}) => void

  export type StoreSaveNewDateOfTasks = (context: ActionContext, arr: Array<{id: string, date: string}>) => void
  export type SaveNewDateOfTasks = (arr: Array<{id: string, date: string}>) => void

  export type StoreUnCompleteSubtasks = (context: ActionContext, taskId: string) => void
  export type UnCompleteSubtasks = (taskId: string) => void

  export type StoreAddProjectTask = (context: ActionContext, obj: {task: Task, projectId: string, position: number, order: string[], utc: UtcObj | null}) => void
  export type AddProjectTask = (obj: {task: Task, projectId: string, position: number, order: string[], utc: UtcObj | null}) => void

  export type StoreToggleCompleteTask = (context: ActionContext, obj: {id: string, completed: boolean}) => void
  export type ToggleCompleteTask = (obj: {id: string, completed: boolean}) => void

  export type StoreRemoveTasksFromProject = (context: ActionContext, ids: string[]) => void
  export type RemoveTasksFromProject = (ids: string[]) => void
}
