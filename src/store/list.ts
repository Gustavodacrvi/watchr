
import { States as RootState } from '@/store/index'
import { List } from '@/interfaces/app';

interface States {
  transactionBetweenList: boolean
  movedElement: boolean
  getIds: boolean
  movedElementGroup: string
  transactionListName: string
  order: string[]
  movements: {newList: List, oldList: List}[]
}

interface Mutations {
  transfereElement: (state: States, obj: {moves: {newList: List, oldList: List}[], movedList: string}) => void
  saveIds: (state: States, obj: {ids: string[], group: string}) => void
  saveNewPosition: (state: States) => void
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
    transactionBetweenList: false,
    transactionListName: '',
    movements: [],

    getIds: false,
    movedElement: false,
    movedElementGroup: '',
    order: [],
  } as States,
  mutations: {
    transfereElement(state: States, movements) {
      state.transactionListName = movements.movedList
      state.transactionBetweenList = !state.transactionBetweenList
      state.movements = movements.moves
    },
    saveIds(state: States, obj) {
      state.order = obj.ids
      state.movedElementGroup = obj.group
      state.movedElement = !state.movedElement
    },
    saveNewPosition(state: States) {
      state.getIds = !state.getIds
    },
  } as Mutations,
  getters: {

  } as Getters,
  actions: {

  } as Actions,
}
