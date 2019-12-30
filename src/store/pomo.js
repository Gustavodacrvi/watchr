
import { fire, auth } from './index'
import fb from 'firebase/app'

import { userRef } from "@/utils/firestore"

import mom from 'moment/src/moment'

const TOD_STR = mom().format('Y-M-D')

const tickSound = new Audio(require('@/assets/mp3/clock-tick.mp3'))

tickSound.loop = true

const areEqual = (s1, s2) =>  {
  const split1 = s1.split(':')
  const split2 = s2.split(':')

  const p = s => parseInt(s, 10)

  return p(split1[0]) === p(split2[0]) && p(split1[1]) === p(split2[1])
}

export default {
  namespaced: true,
  state: {
    cycles: 0,
    longCycles: 0,
    current: '00:00',

    duration: '00:10',
    currentDuration: '00:05',
    shortRest: '00:5',
    longRest: '00:10',
    task: null,

    running: false,
    rest: null,

    addInterval: null,
  },
  mutations: {
    selectTask(state, task) {
      state.task = task || null
    },
    removeTask(state) {
      state.task = null
    },
  },
  actions: {
    getData({dispatch}) {
      setTimeout(() => {
        dispatch('update')
      }, 300)
    },
    update({state, rootState, dispatch}) {
      const {userInfo} = rootState
      if (userInfo && userInfo.pomoDate === TOD_STR) {
        state.cycles = userInfo.cycles
        state.longCycles = userInfo.longCycles

        if (state.cycles === undefined) state.cycles = 0
        if (state.longCycles === undefined) state.longCycles = 0

        if (state.cycles === 4) {
          state.cycles = 0
          state.longCycles++
          dispatch('saveUser')
        }
      }
    },
    toggle({dispatch, state}) {
      dispatch('toggleInterval')
      state.running = !state.running

      if (state.running) tickSound.play()
      else tickSound.pause()
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

          if (completed && !state.rest) {
            state.cycles++

            const longRest = state.cycles === 4

            state.rest = longRest ? 'long' : 'short'
            state.currentDuration = longRest ? state.longRest : state.shortRest
            state.current = '00:00'

            clearInterval(state.addInterval)
            state.running = false
            state.addInterval = null
            tickSound.pause()
            window.navigator.vibrate(200)
            dispatch('saveUser')
          } else if (completed) {
            state.rest = null
            state.currentDuration = state.duration
            state.current = '00:00'

            clearInterval(state.addInterval)
            state.running = false
            state.addInterval = null

            tickSound.pause()
            window.navigator.vibrate(200)
            if (state.cycles === 4) {
              state.cycles = 0
              state.longCycles++
              dispatch('saveUser')
            }
          }
        }, 1000)
      else {
        state.current = '00:00'
        clearInterval(state.addInterval)
        state.addInterval = null
      }
    },
    saveUser({state}) {
      userRef().set({
        pomoDate: mom().format('Y-M-D'),
        cycles: state.cycles,
        longCycles: state.longCycles,
      }, {merge: true})
    },
  },
}
