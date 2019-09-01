

/* tslint:disable:max-line-length */

import { Label, Project, Folder } from '../app'
import { State as RootState } from '@/interfaces/store/index'

export namespace ProjectState {
  export type projects = Project[]
  export type folders = Folder[]
}

export interface State {
  projects: ProjectState.projects
  folders: ProjectState.folders
}

export namespace ProjectGetters {

}

interface ActionContext {
  state: State
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

export interface Getters {
  [key: string]: (state: State, getters: Getters) => void
}

export namespace ProjectActions {

}
