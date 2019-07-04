
import { States as RootState } from '@/store/index'
import { List } from '@/interfaces/app';

interface States {

}

interface Mutations {
  moveElement: (state: States, obj: {newList: List, oldList: List}) => void
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
    moveElement(state: States, {oldList, newList}) {
      console.log('old', oldList.level, oldList.elementId, oldList.parentId)
      console.log('new', newList.level, newList.elementId, newList.parentId)
    },
  } as Mutations,
  getters: {

  } as Getters,
  actions: {

  } as Actions,
}
