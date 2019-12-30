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
  methods: {
    bindTaskOptions(opt) {
      utils.bindOptionsToEventListener(this.$refs['task'], opt, this, 'click')
    },
    findTask() {
      this.$store.dispatch('pushPopup', {
        comp: 'FastSearch',
        payload: {
          callback: (route, task) => {
            this.$store.commit('pomo/selectTask', task)
            this.bindTaskOptions([
              {
                name: this.l['Complete task'],
                callback: () => {
                  this.$store.dispatch('task/completeTasks', [this.task])
                  this.$store.commit('pomo/removeTask')
                },
              },
              {
                name: this.l['Remove task'],
                callback: () => {
                  this.bindTaskOptions([])
                  this.$store.commit('pomo/removeTask')
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
