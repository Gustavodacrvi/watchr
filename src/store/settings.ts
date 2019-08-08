
import { States as RootState } from '@/store/index'

import 'moment-timezone/builds/moment-timezone-with-data'

import timezone from 'moment-timezone'

interface States {
  timeZone: '13:00' | '1:00pm' | string
  dateFormat: string
  timeFormat: string
  startOfTheWeek: string
  nextWeek: string
  mobileTaskLabels: string
  desktopTaskLabels: string
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
  saveSettings: (context: ActionContext, obj: {
    timeZone: string,
    dateFormat: string,
    timeFormat: string,
    startOfTheWeek: string,
    nextWeek: string,
    desktopTaskLabels: string,
    mobileTaskLabels: string,
  }) => void
  setDefaultSettings: (context: ActionContext) => void
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
    desktopTaskLabels: '',
    mobileTaskLabels: '',
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
            state.mobileTaskLabels = data.mobileTaskLabels
            state.desktopTaskLabels = data.desktopTaskLabels
          }
        })
    },
    saveSettings({ rootState }, s) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('settings').doc(rootState.uid).update({
          timeZone: s.timeZone,
          dateFormat: s.dateFormat,
          timeFormat: s.timeFormat,
          nextWeek: s.nextWeek,
          startOfTheWeek: s.startOfTheWeek,
          mobileTaskLabels: s.mobileTaskLabels,
          desktopTaskLabels: s.desktopTaskLabels,
        })
    },
    setDefaultSettings({ rootState, dispatch }) {
      if (rootState.uid)
        dispatch('addDefaultSettings', rootState.uid)
    },
    addDefaultSettings({ rootState }, id: string) {
      if (rootState.firestore)
        rootState.firestore.collection('settings').doc(id).set({
          userId: id,
          timeZone: timezone.tz.guess(),
          dateFormat: 'DD-MM-YYYY',
          timeFormat: '13:00',
          startOfTheWeek: 'Monday',
          nextWeek: 'Monday',
          mobileTaskLabels: 'Show on mouse/touch hover',
          desktopTaskLabels: 'Show on mouse/touch hover',
        })
    },
  } as Actions,
}
