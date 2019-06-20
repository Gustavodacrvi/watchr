
import { Perspective } from '@/interfaces/app'
import uuid from 'uuid'

interface States {
  perspectives: Perspective[] | undefined
}

interface Mutations {
  setDefaultData: () => void
  save: () => void
  getSavedData: () => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  smartBindedPerspectives: () => Perspective[] | undefined
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string) => void
}

interface Actions {
  setDefaultData: (context: ActionContext) => void
  updatePerspectives: (context: ActionContext, perspectives: Perspective[]) => void
  [key: string]: (context: ActionContext, payload: any) => any
}


export default {
  namespaced: true,
  state: {
    perspectives: undefined,
  } as States,
  mutations: {
    save(state: States): void {
      if (!localStorage.getItem('watchrIsLogged')) {
        localStorage.setItem('watchrPerspectives', JSON.stringify(state.perspectives))
      }
    },
    getSavedData(state: States): void {
      if (!localStorage.getItem('watchrIsLogged')) {
        state.perspectives = JSON.parse(localStorage.getItem('watchrPerspectives') as any)
      }
    },
  } as Mutations,
  getters: {
    smartBindedPerspectives(state: States): Perspective[] | undefined {
      if (state.perspectives) {
        return state.perspectives.filter((el: Perspective) => el.binded && el.smart)
      } else {
        return undefined
      }
    },
  } as Getters,
  actions: {
    setDefaultData({state, commit}): void {
      state.perspectives = [
        {name: 'Today', binded: true, smart: true, icon: 'calendar-day', iconColor: '#FFE366', id: uuid(),
         hasToBeEmpty: [], showTaskNumber: true, showWhenNotEmpty: false},
        {name: 'Inbox', binded: true, smart: true, icon: 'inbox', iconColor: '#83B7E2', hasToBeEmpty: [], id: uuid(),
         showTaskNumber: true, showWhenNotEmpty: false},
        {name: 'Upcoming', binded: true, smart: true, icon: 'calendar-alt', iconColor: '#FF6B66', id: uuid(),
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
        {name: 'Anytime', binded: true, smart: true, icon: 'layer-group', iconColor: '#88DDB7', id: uuid(),
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
        {name: 'Someday', binded: true, smart: true, icon: 'archive', iconColor: '#E2B983', id: uuid(),
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
      ]
      commit('save')
    },
    updatePerspectives({state, commit}, perspectives: Perspective[]): void {
      state.perspectives = perspectives
      commit('save')
    },
  } as Actions,
}
