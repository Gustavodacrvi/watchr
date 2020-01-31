<template>
  <div class="PomoHelper">
    <div class="progress-line">
      <div class="line" :style='{width, backgroundColor: color}'></div>
    </div>
    <div class="cont">
      <div class="top">
        <div>
          <span class="time">{{ getTime }}</span>
        </div>
        <div>
          <Squares class="tiny"/>
        </div>
      </div>
      <div class="bottom">
        <div class="task-wrapper">
          <TaskComp class="no-transform"/>
        </div>
        <div>
          <div class="auth-wrapper">
            <AuthButton class="btn"
              value='Close'
              @click="close"
            />
          </div>
          <PomoBtn class="tiny" style="display: inline-block !important;"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Squares from './../Views/Pomodoro/Squares.vue'
import TaskComp from './../Views/Pomodoro/TaskComp.vue'
import PomoBtn from './../Views/Pomodoro/PomoBtn.vue'

import AuthButton from '@/components/Auth/Button.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    Squares, TaskComp,
    PomoBtn, AuthButton,
  },
  methods: {
    close() {
      this.$store.commit('pomo/closeHelper')
    },
  },
  computed: {
    ...mapState({
      total: state => state.pomo.currentDuration,
      current: state => state.pomo.current,
    }),
    ...mapGetters({
      platform: 'platform',
      color: 'pomo/getPomoColor',
      shadow: 'pomo/getPomoShadow',
      currentValue: 'pomo/currentValue',
      totalValue: 'pomo/totalValue',
      getTime: 'pomo/getTime',
      taskMsg: 'pomo/taskMsg',
    }),
    width() {
      return (100 * this.currentValue / this.totalValue) + '%'
    },
  }
}

</script>

<style scoped>

.PomoHelper {
  height: 110px;
  border-radius: 16px;
  position: relative;
}

.progress-line {
  position: absolute;
  top: 1px;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 16px;
  overflow: hidden;
  background-color: var(--sidebar-color);
}

.line {
  height: 100%;
  transition-duration: .3s;
}

.cont {
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100%;
}

.top, .bottom {
  flex-basis: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-wrapper {
  display: inline-block;
  margin-right: 8px;
}

.btn {
  border-radius: 50px !important;
  padding: 9px 18px;
}

.time {
  font-size: 1.4em;
}

.task-wrapper {
  max-width: 45%;
}

</style>
