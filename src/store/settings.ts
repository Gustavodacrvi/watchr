
import { State, SetActions } from '@/interfaces/store/settings'

import 'moment-timezone/builds/moment-timezone-with-data'

import timezone from 'moment-timezone'

interface Actions {
  getData: SetActions.StoreGetData
  saveSettings: SetActions.StoreSaveSettings
  setDefaultSettings: SetActions.StoreSetDefaultSettings
  addDefaultSettings: SetActions.StoreAddDefaultSettings
  [key: string]: (...arr: any[]) => any
}

export default {
  namespaced: true,
  state: {
    timeZone: '',
    dateFormat: 'M-D-Y',
    timeFormat: '13:00',
    startOfTheWeek: '',
    nextWeek: '',
  } as State,
  mutations: {

  } as {},
  getters: {

  } as {},
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
    saveSettings({ rootState }, s) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('settings').doc(rootState.uid).update({
          timeZone: s.timeZone,
          dateFormat: s.dateFormat,
          timeFormat: s.timeFormat,
          nextWeek: s.nextWeek,
          startOfTheWeek: s.startOfTheWeek,
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
          dateFormat: 'D-M-Y',
          timeFormat: '13:00',
          startOfTheWeek: 'Monday',
          nextWeek: 'Monday',
        })
    },
  } as Actions,
}
