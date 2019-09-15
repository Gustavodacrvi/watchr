
import { State, SetActions } from '@/interfaces/store/settings'

import 'moment-timezone/builds/moment-timezone-with-data'

import timezone from 'moment-timezone'

interface Actions {
  getData: SetActions.StoreGetData
  saveSettings: SetActions.StoreSaveSettings
  setDefaultSettings: SetActions.StoreSetDefaultSettings
  addDefaultSettings: SetActions.StoreAddDefaultSettings
  saveFcmToken: SetActions.StoreSaveFcmToken
  [key: string]: (...arr: any[]) => any
}

export default {
  namespaced: true,
  state: {
    timeZone: '',
    dateFormat: 'M-D-Y',
    fcmTokens: [],
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
      return new Promise((resolve) => {
        let firstTime = true
        if (rootState.fr && rootState.uid)
          rootState.fr.collection('settings').doc(rootState.uid).onSnapshot(snap => {
            const data = snap.data()
            if (data) {
              state.timeZone = data.timeZone
              state.dateFormat = data.dateFormat
              state.timeFormat = data.timeFormat
              state.startOfTheWeek = data.startOfTheWeek
              state.nextWeek = data.nextWeek
              state.fcmTokens = data.fcmTokens
            }
            if (firstTime) resolve()
            firstTime = false
          })
      })
    },
    saveSettings({ rootState }, s) {
      if (rootState.fr && rootState.uid)
        rootState.fr.collection('settings').doc(rootState.uid).update({
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
    addDefaultSettings({ rootState }, id) {
      if (rootState.fr)
        rootState.fr.collection('settings').doc(id).set({
          userId: id,
          timeZone: timezone.tz.guess(),
          dateFormat: 'D-M-Y',
          timeFormat: '13:00',
          startOfTheWeek: 'Monday',
          nextWeek: 'Monday',
        })
    },
    saveFcmToken({ rootState, state }, token) {
      if (rootState.fr && rootState.uid && state.fcmTokens) {
        const tks = state.fcmTokens
        let foundToken = tks.find(el => el.token === token) !== undefined
        if (!foundToken)
          if (tks.length < 5) {
            tks.push({
              token, date: timezone().toDate(),
            })
            rootState.fr.collection('settings').doc(rootState.uid).update({
              fcmTokens: tks,
            })
          }
          else {
            let oldestId = 0
            let oldestDate = timezone()
            for (let i = 0; i < tks.length; i++) {
              const saved = timezone(tks[0].date.seconds * 1000)
              if (saved.isBefore(oldestDate)) {
                oldestDate = saved
                oldestId = i
              }
            }
            tks.splice(oldestId, 1, {token, date: timezone().toDate()})
            rootState.fr.collection('settings').doc(rootState.uid).update({
              fcmTokens: tks,
            })
          }
      }
    },
  } as Actions,
}
