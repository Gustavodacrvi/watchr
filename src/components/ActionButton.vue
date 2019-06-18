<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <span class='main' :class='{close: showing}' @click='showing = !showing'>
        <icon class='icon' icon='plus' color='white'></icon>
      </span>
      <transition name='below-trans'>
        <div class='left-wrapper' v-if='showing'>
          <span class='btn left' v-for='btn in leftButtons' :key='btn.icon' :style='`background-color: ${btn.backColor}`' @click='btn.click'>
            <icon :icon='btn.icon' :color='btn.iconColor'></icon>
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

interface Buttons {
  icon: string
  iconColor: string
  backColor: string
  click: () => void
}

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class ActionButton extends Vue {
  public leftButtons: Buttons[] = [
    {icon: 'inbox', iconColor: 'white', backColor: '#83B7E2', click: () => console.log(3)},
    {icon: 'calendar-day', iconColor: 'white', backColor: '#FFE366', click: () => console.log(3)},
    {icon: 'calendar-alt', iconColor: 'white', backColor: '#FF6B66', click: () => console.log(3)},
  ]

  public showing: boolean = false
}

</script>

<style scoped>

.wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
}

.relative-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main {
  pointer-events: all;
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 45px;
  height: 45px;
  display: flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  background-color: #AF92F7;
  transition-duration: .3s;
}

.main.close {
  transform: rotate(45deg);
}

.left-wrapper {
  position: absolute;
  height: 45px;
  bottom: 16px;
  right: 70px;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}

.btn {
  display: inline-block;
  border-radius: 100px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: all;
}

.btn.left {
  margin: 0 6px;
}

.below-trans-enter-active, .below-trans-leave-active {
  transition: bottom .3s;
}

.below-trans-enter {
  bottom: -50px;
}

.below-trans-enter-to, .below-trans-leave {
  bottom: 16px;
}

.below-trans-leave-to {
  bottom: -50px;
}

</style>
