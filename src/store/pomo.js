
import { fire, auth } from './index'
import fb from 'firebase/app'

import { userRef, pomoDoc, uid, fd } from "@/utils/firestore"

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

const tickSound = new Audio(require('@/assets/mp3/clock-tick.mp3'))
const alarmClock = new Audio(require('@/assets/mp3/alarm-clock.mp3'))

tickSound.loop = true
alarmClock.loop = false

let savedVolume = localStorage.getItem('pomo_volume')

if (!savedVolume)
  savedVolume = .5

console.log(savedVolume)

const parsedVol = JSON.parse(savedVolume)

tickSound.volume = parsedVol
alarmClock.volume = parsedVol

const areEqual = (s1, s2) =>  {
  const split1 = s1.split(':')
  const split2 = s2.split(':')

  const p = s => parseInt(s, 10)

  return p(split1[0]) === p(split2[0]) && p(split1[1]) === p(split2[1])
}
const getValueFromTime = time => {
  const split = time.split(':')
  
  const hour = parseInt(split[0], 10)
  const sec = parseInt(split[1], 10)

  return sec + (hour * 60)
}

export default {
  namespaced: true,
  state: {
    stats: null,
    volume: parsedVol,
    cycles: 0,
    current: '00:00',
    start: null,
    openHelper: false,

    duration: '25:00',
    currentDuration: '25:00',
    shortRest: '05:00',
    longRest: '15:00',
    task: null,

    running: false,
    rest: null,

    addInterval: null,
  },
  mutations: {
    saveVolume(state, vol) {
      state.volume = vol
      tickSound.volume = vol
      alarmClock.volume = vol
      localStorage.setItem('pomo_volume', vol)
    },
    selectTask(state, task) {
      state.task = task || null
    },
    removeTask(state) {
      state.task = null
    },
    closeHelper(state) {
      state.openHelper = false
    },
  },
  getters: {
    cyclePomos(state) {
      return state.cycles % 4
    },
    longCycles(state) {
      return Math.floor(state.cycles / 4)
    },
    getPomoColor(state) {
      return state.rest ? 'var(--primary)' : 'var(--dark-red)'
    },
    getPomoShadow(state) {
      return state.rest ? 'rgba(89, 160, 222, .2)' : 'rgba(234, 58, 52, .8)'
    },
    currentValue(state) {
      return getValueFromTime(state.current)
    },
    totalValue(state) {
      return getValueFromTime(state.currentDuration)
    },
    getTime(state, getters) {
      const diff = getters.totalValue - getters.currentValue

      return mom(`${diff / 60}:${diff % 60}`, 'mm:ss').format('mm:ss')
    },
    taskMsg(state, d, f, rootGetters) {
      if (state.task) return state.task.name
      return rootGetters.l['Select task']
    }
  },
  actions: {
    getData({state, dispatch}) {
      setTimeout(() => {
        dispatch('updateDurations')
      }, 1000)
      return Promise.all([
        new Promise(resolve => {
          pomoDoc().onSnapshot(snap => {
            state.stats = snap.data()

            const info = state.stats && state.stats.dates[TOD_STR]
            if (info) {
              state.cycles = info.completedPomos
      
              if (state.cycles === undefined) state.cycles = 0
            }
            
            resolve()
          })
        })
      ])
    },
    updateDurations({rootState, state}, obj) {
      let pomo = rootState.userInfo.pomo

      if (obj) pomo = obj.pomo
      
      if (pomo) {
        state.shortRest = pomo.shortRest
        state.longRest = pomo.longRest
        state.duration = pomo.duration
        state.currentDuration = pomo.duration
      }
    },
    toggle({dispatch, state}, obj) {
      if (obj && obj.task)
        state.task = obj.task

      const stop = (obj && obj.stopToggle)
      
      if (!state.running || !stop) {
        state.running = !state.running
  
        if (state.running) {
          state.openHelper = true
          tickSound.play()

          state.start = mom().format('HH:mm:ss')
        } else {
          dispatch('save')
          tickSound.pause()
        }

        dispatch('toggleInterval')
      }
    },
    save({state, dispatch}) {
      if (!state.rest)
        dispatch('saveFocusTime')
      else dispatch('saveRestTime')
    },
    skipRest({state}) {
      state.rest = null
      state.currentDuration = state.duration
      state.current = '00:00'

      if (state.addInterval)
        clearInterval(state.addInterval)
      state.addInterval = null
      state.running = false

      tickSound.pause()
    },
    toggleInterval({state, dispatch}) {
      if (!state.addInterval)
        state.addInterval = setInterval(() => {
          const split = state.current.split(':')

          let min = parseInt(split[0], 10)
          let sec = parseInt(split[1], 10)

          sec++

          if (sec >= 60) {
            min++
            sec = 0
          }
          
          state.current = `${min}:${sec}`
          const completed = areEqual(state.current, state.currentDuration)

          if (completed) {
            alarmClock.play()
            setTimeout(() => {
              alarmClock.pause()
            }, 10000)
          }

          if (completed && !state.rest) {
            dispatch('saveFocusTime', true)
            state.cycles++

            const longRest = state.cycles % 4 === 0

            state.rest = longRest ? 'long' : 'short'
            state.currentDuration = longRest ? state.longRest : state.shortRest
            state.current = '00:00'

            clearInterval(state.addInterval)
            state.running = false
            state.addInterval = null
            tickSound.pause()
            window.navigator.vibrate(200)
          } else if (completed) {
            dispatch('saveRestTime', true)
            state.rest = null
            state.currentDuration = state.duration
            state.current = '00:00'

            clearInterval(state.addInterval)
            state.running = false
            state.addInterval = null

            tickSound.pause()
            window.navigator.vibrate(200)
          }
        }, 1000)
      else {
        state.current = '00:00'
        clearInterval(state.addInterval)
        state.addInterval = null
      }
    },
    updateStats({}, obj) {
      pomoDoc().set({
        userId: uid(),
        dates: {
          [TOD_STR]: obj,
        },
      }, {merge: true})
    },
    saveFocusTime({state, dispatch}, completed) {
      const sec = getValueFromTime(state.current)

      if (sec > 3 && state.start) {
        const obj = {
          focus: fd().increment(sec),
          pomoEntries: fd().arrayUnion(state.start, mom().format('HH:mm:ss')),
        }
        
        if (completed)
          obj['completedPomos'] = fd().increment(1)
        
        dispatch('updateStats', obj)
      }
    },
    saveRestTime({state, dispatch}, completed) {
      const sec = getValueFromTime(state.current)

      if (sec > 3 && state.start) {
        const obj = {
          rest: fd().increment(sec),
          restEntries: fd().arrayUnion(state.start, mom().format('HH:mm:ss'))
        }

        if (completed)
          obj['completedRest'] = fd().increment(1)
      
        dispatch('updateStats', obj)
      }
    },
  },
}
