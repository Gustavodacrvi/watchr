
import { Perspective, VuexModule } from '@/interfaces/app'
import uuid from 'uuid'

interface States {
  perspectives: Perspective[]
}

interface Mutations {
  save: () => void
  getSavedData: () => void
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
  toggleBindPerspectiveById: (context: ActionContext, obj: {ids: string[], binded: boolean | undefined}) => void
  [key: string]: (context: ActionContext, payload: any) => any
}


export default {
  namespaced: true,
  state: {
    perspectives: [],
  } as States,
  mutations: {
    save(state: States) {
      if (!localStorage.getItem('watchrIsLogged'))
        localStorage.setItem('watchrPerspectives', JSON.stringify(state.perspectives))
    },
    getSavedData(state: States) {
      if (!localStorage.getItem('watchrIsLogged'))
        state.perspectives = JSON.parse(localStorage.getItem('watchrPerspectives') as any)
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
    setDefaultData({state, commit}) {
      state.perspectives = [
        {name: 'All stuff', binded: false, smart: true, icon: 'list', iconColor: '#86e283', id: uuid(),
        hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
        {name: 'Today', binded: true, smart: true, icon: 'star', iconColor: '#FFE366', id: uuid(),
         hasToBeEmpty: [], showTaskNumber: true, showWhenNotEmpty: false},
         {name: 'Tomorrow', binded: false, smart: true, icon: 'sun', iconColor: '#faa46b', id: uuid(),
        hasToBeEmpty: [], showTaskNumber: false, showWhenNotEmpty: false},
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
    updatePerspectives({state, commit}, perspectives: Perspective[]) {
      state.perspectives = perspectives
      commit('save')
    },
    toggleBindPerspectiveById({state, commit}, {ids, binded}) {
      for (const id of ids) {
        const pers: Perspective | undefined = state.perspectives.find(el => {
          return el.id === id
        })
        if (pers)
          if (binded)
            pers.binded = true
          else if (binded === false)
            pers.binded = false
          else
            pers.binded = pers.binded
      }
      commit('save')
    },
  } as Actions,
} as VuexModule
