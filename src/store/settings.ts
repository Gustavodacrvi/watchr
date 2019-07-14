
import { States as RootState } from '@/store/index'

import Moment from 'moment'
import 'moment-timezone/builds/moment-timezone-with-data'

interface States {
  timeZone: string
  dateFormat: string
  timeFormat: string
  startOfTheWeek: string
  nextWeek: string
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
  getData: (context: ActionContext) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    timeZone: '',
    dateFormat: '',
    timeFormat: '',
    startOfTheWeek: '',
    nextWeek: '',
  } as States,
  mutations: {

  } as Mutations,
  getters: {

  } as Getters,
  actions: {
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('settings').doc(rootState.uid).onSnapshot(snap => {
          const data = snap.data()
          if (data) {
            state.timeZone = data.timeZone
            state.dateFormat = data.dateFormat
            state.timeFormat = data.timeFormat
            state.startOfTheWeek = data.startOfTheWeek
            state.nextWeek = data.nextWeek
          }
        })
    },
    addDefaultSettings({ rootState }, id: string) {
      const m = Moment as any
      if (rootState.firestore)
        rootState.firestore.collection('settings').doc(id).set({
          userId: id,
          timeZone: '',
          dateFormat: 'DD-MM-YYYY',
          timeFormat: '13:00',
          startOfTheWeek: 'Monday',
          nextWeek: 'Monday',
        })
    },
  } as Actions,
}
