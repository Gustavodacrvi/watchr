<template>
  <div class="Pomodoro" :class="layout">
    <Squares/>
    <TaskComp/>
    <PomoClock/>
    <PomoBtn/>
  </div>
</template>

<script>

import PomoClock from './PomoClock.vue'
import AuthButton from '@/components/Auth/Button.vue'
import Squares from './Squares.vue'
import TaskComp from './TaskComp.vue'
import PomoBtn from './PomoBtn.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils/'

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

export default {
  components: {
    AuthButton,
    PomoClock, PomoBtn,
    Squares, TaskComp,
  },
  computed: {
    ...mapGetters(['layout']),
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

.desktop .btn:hover {
  background-color: rgb(236, 80, 75);
  outline: none;
}

</style>
