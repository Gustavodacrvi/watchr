<template>
  <div class="Pomodoro" :class="platform">
    <Squares/>
    <TaskComp/>
    <PomoClock/>
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
import Squares from './Squares.vue'
import TaskComp from './TaskComp.vue'

import { userRef } from '@/utils/firestore'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils/'

import mom from 'moment/src/moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  components: {
    AuthButton,
    PomoClock,
    Squares, TaskComp,
  },
  methods: {
    click() {
      this.$store.dispatch('pomo/toggle')
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,

      running: state => state.pomo.running,
      task: state => state.pomo.task,
      rest: state => state.pomo.rest,
      cycles: state => state.pomo.cycles,
      longCycles: state => state.pomo.longCycles,
      duration: state => state.pomo.duration,
      currentDuration: state => state.pomo.currentDuration,
      current: state => state.pomo.current,
    }),
    ...mapGetters({
      l: 'l',
      platform: 'platform',
      taskMsg: 'pomo/taskMsg',
    }),
    btnMsg() {
      if (this.running) return this.l['Stop']
      if (this.rest)
        return this.rest === 'short' ? this.l['Short rest'] : this.l['Long rest']
      return this.l['Start']
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

.btn-wrapper {
  display: flex;
  justify-content: center;
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

</style>
