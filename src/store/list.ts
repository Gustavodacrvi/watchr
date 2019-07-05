
import { States as RootState } from '@/store/index'
import { List } from '@/interfaces/app';

interface States {
  transactionBetweenList: boolean
  transactionListName: string
  movements: {newList: List, oldList: List}[]
}

interface Mutations {
  moveElement: (state: States, obj: {moves: {newList: List, oldList: List}[], movedList: string}) => void
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
  } as States,
  mutations: {
    moveElement(state: States, movements) {
      state.transactionListName = movements.movedList
      state.transactionBetweenList = !state.transactionBetweenList
      state.movements = movements.moves
    },
  } as Mutations,
  getters: {

  } as Getters,
  actions: {

  } as Actions,
}
