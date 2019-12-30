<template>
  <div class="Pomodoro" :class="platform">
    <div class="squares">
      <Square v-for="i in 4"
        :key="i"
        :check="i < (cycles + 1)"
      />
      <span v-show="longCycles > 0" class="long-msg">+{{ longCycles }}</span>
    </div>
    <div class="task-wrapper" @click.stop="selectTask">
      <div class="task rb cursor" ref="task">
        <span class="msg">{{ msg }}</span>
        <CircleBubble/>
      </div>
    </div>
    <PomoClock
      :total='currentDuration'
      :current='current'
      :color='getPomoColor'
      :shadow='getPomoShadow'
    />
    <div class="btn-wrapper">
      <button class="btn cursor remove-highlight" :class="{running, rest}" @click="click">
        {{ btnMsg }}
        <CircleBubble
          innerColor='var(--white)'
          outerColor='white'
          opacity='0'
        />
      </button>
    </div>
  </div>
</template>

<script>

import PomoClock from './PomoClock.vue'
import AuthButton from '@/components/Auth/Button.vue'
import Square from './Square.vue'

import { userRef } from '@/utils/firestore'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils/'

import mom from 'moment/src/moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  components: {
    AuthButton,
    PomoClock,
    Square,
  },
  data() {
    return {
      cycles: 0,
      longCycles: 0,
      current: '00:00',

      duration: '25:00',
      currentDuration: '25:00',
      shortRest: '05:00',
      longRest: '15:00',
      task: null,

      running: false,
      rest: null,

      addInterval: null,
      tickSound: new Audio(require('@/assets/mp3/clock-tick.mp3')),
    }
  },
  created() {
    this.tickSound.loop = true
    this.update()
  },
  beforeDestroy() {
    this.tickSound.pause()
  },
  methods: {
    bindTaskOptions(opt) {
      utils.bindOptionsToEventListener(this.$refs['task'], opt, this, 'click')
    },
    findTask() {
      this.$store.dispatch('pushPopup', {
        comp: 'FastSearch',
        payload: {
          callback: (route, task) => {
            this.task = task
            this.bindTaskOptions([
              {
                name: this.l['Complete task'],
                callback: () => {
                  this.$store.dispatch('task/completeTasks', [this.task])
                  this.task = null
                },
              },
              {
                name: this.l['Remove task'],
                callback: () => {
                  this.bindTaskOptions([])
                  this.task = null
                },
              },
              {
                name: this.l['Select another task'],
                callback: () => {
                  this.findTask()
                }
              },
            ])
          },
          onlyTasks: true,
        }
      })
    },
    selectTask() {
      if (!this.task) this.findTask()
    },
    update() {
      if (this.userInfo && this.userInfo.pomoDate === TOD_STR) {
        this.cycles = this.userInfo.cycles
        this.longCycles = this.userInfo.longCycles

        if (this.cycles === undefined) this.cycles = 0
        if (this.longCycles === undefined) this.cycles = 0

        if (this.cycles === 4) {
          this.cycles = 0
          this.longCycles++
          this.saveUser()
        }
      }
    },
    areEqual(s1, s2) {
      const split1 = s1.split(':')
      const split2 = s2.split(':')

      const p = s => parseInt(s, 10)

      return p(split1[0]) === p(split2[0]) && p(split1[1]) === p(split2[1])
    },
    toggleInterval() {
      if (!this.addInterval)
        this.addInterval = setInterval(() => {
          const split = this.current.split(':')

          let min = parseInt(split[0], 10)
          let sec = parseInt(split[1], 10)

          sec++

          if (sec >= 60) {
            min++
            sec = 0
          }
          
          this.current = `${min}:${sec}`
          const completed = this.areEqual(this.current, this.currentDuration)

          if (completed && !this.rest) {
            this.cycles++

            const longRest = this.cycles === 4

            this.rest = longRest ? 'long' : 'short'
            this.currentDuration = longRest ? this.longRest : this.shortRest
            this.current = '00:00'

            clearInterval(this.addInterval)
            this.running = false
            this.addInterval = null
            this.tickSound.pause()
            this.vibrate()
            this.saveUser()
          } else if (completed) {
            this.rest = null
            this.currentDuration = this.duration
            this.current = '00:00'

            clearInterval(this.addInterval)
            this.running = false
            this.addInterval = null

            if (this.cycles === 4) {
              this.cycles = 0
              this.longCycles++
              this.tickSound.pause()
              this.vibrate()
              this.saveUser()
            }
          }
        }, 1000)
      else {
        this.current = '00:00'
        clearInterval(this.addInterval)
        this.addInterval = null
      }
    },
    vibrate() {
      window.navigator.vibrate(200)
    },
    saveUser() {
      userRef(this.userInfo.userId).set({
        pomoDate: mom().format('Y-M-D'),
        cycles: this.cycles,
        longCycles: this.longCycles,
      }, {merge: true})
    },
    click() {
      this.toggleInterval()
      this.running = !this.running

      if (this.running) this.tickSound.play()
      else this.tickSound.pause()
    },
  },
  computed: {
    ...mapState(['userInfo']),
    ...mapGetters(['l', 'platform']),
    btnMsg() {
      if (this.running) return this.l['Stop']
      if (this.rest)
        return this.rest === 'short' ? this.l['Short rest'] : this.l['Long rest']
      return this.l['Start']
    },
    msg() {
      if (this.task) return this.task.name
      return this.l['Select task']
    },
    getPomoColor() {
      return this.rest ? 'var(--primary)' : 'var(--dark-red)'
    },
    getPomoShadow() {
      return this.rest ? 'rgba(89, 160, 222, .2)' : 'rgba(234, 58, 52, .8)'
    },
  },
}

</script>

<style scoped>

.Pomodoro {
  position: absolute;
  width: 100%;
  height: 100%;
  flex-basis: 1000px;
}

.squares {
  margin-top: 14px;
  margin-left: 8px;
}

.mobile .squares {
  margin-top: 0;
}

.btn-wrapper {
  display: flex;
  justify-content: center;
}

.task-wrapper {
  display: flex;
  justify-content: center;
  transform: translateY(30px);
}

.mobile .task-wrapper {
  transform: translateY(10px);
}

.task {
  position: relative;
  display: inline-block;
  padding: 10px;
  max-width: 270px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition-duration: .2s;
}

.task:hover {
  background-color: var(--light-gray);
}

.btn {
  position: relative;
  padding: 16px 38px;
  background-color: var(--dark-red);
  border-radius: 500px;
  color: white;
  box-shadow: 0 0 40px rgba(234, 58, 52, .4);
  transition-duration: .2s;
  overflow: hidden;
  border: none;
}

.desktop .btn:hover {
  background-color: rgb(236, 80, 75);
  outline: none;
}

.running {
  background-color: transparent;
  border: 1px solid var(--dark-red);
  color: var(--dark-red);
}

.rest {
  box-shadow: 0 0 24px rgba(89, 160, 222, .2);
  background-color: var(--primary);
  color: white;
}

.rest.running {
  background-color: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}

.running:hover {
  color: white;
}

.long-msg {
  position: relative;
  bottom: 5px;
  color: var(--dark-red);
  font-size: 1.5em;
}

</style>
