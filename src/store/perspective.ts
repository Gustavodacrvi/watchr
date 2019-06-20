
import { Perspective } from '@/interfaces/app'

interface States {
  perspectives: Perspective[] | undefined
}

interface Mutations {
  setDefaultData: () => void
  updatePerspectives: (state: States, perspectives: Perspective[]) => void
  [key: string]: (state: States, payload: any) => any
}

interface Getters {
  smartBindedPerspectives: () => Perspective[] | undefined
  [key: string]: (state: States, getters: any, rootState: States, rootGetters: any) => any
}

export default {
  namespaced: true,
  state: {
    perspectives: undefined,
  } as States,
  mutations: {
    setDefaultData(state: States) {
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
    },
    updatePerspectives(state: States, perspectives: Perspective[]): void {
      state.perspectives = perspectives
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
}
