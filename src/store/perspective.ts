
import { Perspective } from '@/interfaces/app'

interface States {
  perspectives: Perspective[] | undefined
}

interface Mutations {
  setDefaultData: () => void
  updatePerspectives: (state: States, perspectives: Perspective[]) => void
  save: () => void
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
  [key: string]: (context: ActionContext, payload: any) => any
}


export default {
  namespaced: true,
  state: {
    perspectives: undefined,
  } as States,
  mutations: {
    updatePerspectives(state: States, perspectives: Perspective[]): void {
      state.perspectives = perspectives
    },
    save(state: States): void {
      if (!localStorage.getItem('watchrIsLogged')) {
        localStorage.setItem('watchrPerspectives', JSON.stringify(state.perspectives))
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
        {name: 'Today', binded: true, smart: true, icon: 'calendar-day', iconColor: '#FFE366',
         hasToBeEmpty: [], showTaskNumber: true, showWhenNotEmpty: false},
        {name: 'Inbox', binded: true, smart: true, icon: 'inbox', iconColor: '#83B7E2', hasToBeEmpty: [],
         showTaskNumber: true, showWhenNotEmpty: false},
        {name: 'Upcoming', binded: true, smart: true, icon: 'calendar-alt', iconColor: '#FF6B66',
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
        {name: 'Anytime', binded: true, smart: true, icon: 'layer-group', iconColor: '#88DDB7',
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
        {name: 'Someday', binded: true, smart: true, icon: 'archive', iconColor: '#E2B983',
         hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
      ]
      commit('save')
    },
  } as Actions,
}
