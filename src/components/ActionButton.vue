<template>
  <div class='wrapper'>
    <div class='relative-wrapper'>
      <transition name='fade'>
        <div v-if='showing' class='margin' @click='showing = false'></div>
      </transition>
      <span class='main' @click='showing = !showing'>
        <!-- <icon class='icon' icon='plus' color='white'></icon> -->
      </span>
      <transition name='below-trans'>
        <div class='left-wrapper' v-if='showing'>
          <span class='btn left' v-for='btn in leftButtons' :key='btn.icon' :style='`background-color: ${btn.backColor}`' @click='btn.click'>
            <!-- <icon :icon='btn.icon' :color='btn.iconColor'></icon> -->
          </span>
        </div>
      </transition>
      <transition name='top-trans'>
        <div v-if='showing' class='top-wrapper'>
          <span class='btn top' v-for='btn in topButtons' :key='btn.icon' :style='`background-color: ${btn.backColor}`' @click='btn.click'>
            <!-- <icon :icon='btn.icon' :color='btn.iconColor'></icon> -->
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'

// import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

interface Buttons {
  icon: string
  iconColor: string
  backColor: string
  click?: () => void
}

@Component({
  components: {
    // icon: FontAwesomeIcon,
  },
})
export default class ActionButton extends Vue {
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void

  public leftButtons: Buttons[] = [
    {icon: 'inbox', iconColor: 'white', backColor: '#83B7E2'},
    {icon: 'calendar-day', iconColor: 'white', backColor: '#FFE366'},
    {icon: 'calendar-alt', iconColor: 'white', backColor: '#fc7d7d'},
  ]
  public topButtons: Buttons[] = [
    {icon: 'stopwatch', iconColor: 'white', backColor: '#70FF66'},
    {icon: 'tags', iconColor: 'white', backColor: '#fc7d7d', click: this.popUp('LabeladderPopup')},
  ]

  public showing: boolean = false

  public popUp(compName: string): () => void {
    return () => {
      this.pushPopUp(compName)
    }
  }
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

.margin {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: all;
  background-color: rgba(0, 0, 0, .4);
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
  background-color: #fc7d7d;
  transition-duration: .3s;
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

.top-wrapper {
  position: absolute;
  width: 45px;
  bottom: 70px;
  right: 16px;
  display: flex;
  align-items: center;
  flex-direction: column-reverse;
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

.btn.top {
  margin: 6px 0;
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

.top-trans-enter-active, .top-trans-leave-active {
  transition: right .3s;
}

.top-trans-enter, .top-trans-leave-to {
  right: -50px;
}

.top-trans-enter-to, .top-trans-leavev {
  right: 16px;
}

</style>
