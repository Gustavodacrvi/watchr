

/* tslint:disable:max-line-length */

import { Label, Project, Folder } from '../app'
import { State as RootState } from '@/interfaces/store/index'

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
  export type GetProjectsByFolderId = (id: string) => Project[]
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
  getProjectsByFolderId: (state: State) => ProjectGetters.GetProjectsByFolderId
  [key: string]: (state: State, getters: Getters) => void
}

export namespace ProjectActions {
  export type GetData = () => void
  export type StoreGetData = (context: ActionContext) => void

  export type StoreAddFoldersOrder = (context: ActionContext, id: string) => void
  export type AddFoldersOrder = (id: string) => Promise<any>

  export type StoreAddFolder = (context: ActionContext, name: string) => void
  export type AddFolder = (name: string) => void
}
