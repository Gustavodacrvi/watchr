
import { SmartPerspective, Task } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  tasks: Task[]
}

interface Getters {

}

interface Mutations {

}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

interface Actions {
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {

  } as States,
  mutations: {

  } as Mutations,
  getters: {

  } as Getters,
  actions: {

  } as Actions,
}
