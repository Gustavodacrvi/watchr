

/* tslint:disable:max-line-length */

import { Label, Project, Folder, Task } from '../app'
import { State as RootState } from '@/interfaces/store/index'
import { Action } from 'vuex';

export namespace ProjectState {
  export type projects = Project[]
  export type folders = Folder[]
  export type foldersOrder = string[]
}

export interface State {
  projects: ProjectState.projects
  folders: ProjectState.folders
  foldersOrder: ProjectState.foldersOrder
}

export namespace ProjectGetters {
  export type SortedFolders = Folder[]
  export type SortedFoldersByName = Folder[]
  export type SortedProjectsByName = Project[]
  export type GetPinedProjectsByFolderId = (id: string) => Project[]
  export type GetProjectsByFolderId = (id: string) => Project[]
  export type GetProjectByName = (name: string) => Project | undefined
}

interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export interface Getters {
  sortedFolders: (state: State) => ProjectGetters.SortedFolders
  sortedFoldersByName: (state: State) => ProjectGetters.SortedFolders
  sortedProjectsByName: (state: State) => ProjectGetters.SortedProjectsByName
  getProjectsByFolderId: (state: State) => ProjectGetters.GetProjectsByFolderId
  getProjectByName: (state: State) => ProjectGetters.GetProjectByName
  getPinedProjectsByFolderId: (state: State) => ProjectGetters.GetPinedProjectsByFolderId
  [key: string]: (state: State, getters: Getters) => void
}

export namespace ProjectActions {
  export type GetData = () => void
  export type StoreGetData = (context: ActionContext) => void

  export type StoreAddFoldersOrder = (context: ActionContext, id: string) => void
  export type AddFoldersOrder = (id: string) => Promise<any>

  export type StoreAddFolder = (context: ActionContext, name: string) => void
  export type AddFolder = (name: string) => void

  export type StoreDeleteFolderAndProjectsByFolderId = (context: ActionContext, id: string) => void
  export type DeleteFolderAndProjectsByFolderId = (id: string) => void

  export type StoreEditFolderNameById = (context: ActionContext, obj: {id: string, name: string}) => void
  export type EditFolderNameById = (obj: {id: string, name: string}) => void

  export type StoreSaveFoldersOrder = (context: ActionContext, ids: string[]) => void
  export type SaveFoldersOrder = (ids: string[]) => void

  export type StoreAddProject = (context: ActionContext, obj: {name: string, foldId: string, description: string}) => void
  export type AddProject = (obj: {name: string, foldId: string, description: string}) => void

  export type StoreMoveProjectsFromFolder = (context: ActionContext, obj: {from: string, to: string, ids: string[]}) => void
  export type MoveProjectsFromFolder = (obj: {from: string, to: string, ids: string[]}) => void

  export type StoreToggleProjectPin = (context: ActionContext, id: string) => void
  export type ToggleProjectPin = (id: string) => void

  export type StoreEditProject = (context: ActionContext, obj: {name: string, id: string, description: string}) => void
  export type EditProject = (obj: {name: string, id: string, description: string}) => void

  export type StoreDeleteProjectById = (context: ActionContext, id: string) => void
  export type DeleteProjectById = (id: string) => void

  export type StoreDeleteProjectTask = (context: ActionContext, obj: {taskId: string, projectId: string}) => void
  export type DeleteProjectTask = (obj: {taskId: string, projectId: string}) => void

  export type StoreUpdateProjectTasks = (context: ActionContext, obj: {id: string, ids: string[]}) => void
  export type UpdateProjectTasks = (obj: {id: string, ids: string[]}) => void

  export type StoreAddProjectHeadings = (context: ActionContext, obj: {index: number, id: string, name: string, ids: string[]}) => void
  export type AddProjectHeadings = (obj: {index: number, name: string, id: string, ids: string[]}) => void
}
