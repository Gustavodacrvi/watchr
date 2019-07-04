
import { Label } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {

}

interface Mutations {

}

interface Getters {

}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
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
