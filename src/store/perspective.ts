
import { Perspective } from '@/interfaces/app'
import uuid from 'uuid'

interface States {
  perspectives: Perspective[]
}

interface Mutations {
  setDefaultData: () => void
  save: () => void
  getSavedData: () => void
  toggleBindPerspectiveById: (state: States, id: string) => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  smartBindedPerspectives: () => Perspective[]
  smartPerspectives: () => Perspective[]
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
    perspectives: [],
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
    toggleBindPerspectiveById(state: States, id: string): void {
      const pers: Perspective | undefined = state.perspectives.find((el: Perspective) => {
        return el.id === id
      })
      if (pers) {
        pers.binded = !pers.binded
      }
    },
  } as Mutations,
  getters: {
    smartPerspectives(state: States): Perspective[] {
      return state.perspectives.filter((el: Perspective) => el.smart)
    },
    smartBindedPerspectives(state: States): Perspective[] {
      return state.perspectives.filter((el: Perspective) => el.binded && el.smart)
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
