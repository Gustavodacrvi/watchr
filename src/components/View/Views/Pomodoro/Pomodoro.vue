<template>
  <div class="Pomodoro" :class="platform">
    <div class="squares">
      <Square :check='true'/>
      <Square/>
      <Square/>
      <Square/>
    </div>
    <PomoClock
      total='00:50'
      current='00:10'
    />
    <div class="btn-wrapper">
      <button class="btn cursor remove-highlight">
        {{ l['Start'] }}
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

import { mapGetters } from 'vuex'

export default {
  components: {
    AuthButton,
    PomoClock,
    Square,
  },
  computed: {
    ...mapGetters(['l', 'platform']),
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

.btn-wrapper {
  display: flex;
  justify-content: center;
}

.btn {
  position: relative;
  padding: 16px 32px;
  background-color: var(--dark-red);
  border-radius: 500px;
  color: white;
  box-shadow: 0 0 40px rgba(234, 58, 52, .4);
  transition-duration: .2s;
  overflow: hidden;
}

.desktop .btn:hover {
  background-color: rgb(236, 80, 75);
  outline: none;
}

</style>
