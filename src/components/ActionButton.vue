<template>
  <div class='wrapper'>
    <div class='relative-wrapper action-comp'>
      <transition name='fade'>
        <div v-if='showing'
          class='margin'
          @click='showing = false'></div>
      </transition>
      <span id='floating-btn'>
        <span
          class='main-button'
          @click='showing = !showing'
        >
          <i class='icon txt pointer fas fa-plus' :style="{color: 'white'}"></i>
          <span class='txt msg' :class='theme'>Add task</span>
        </span>
      </span>
      <transition name='below-trans'>
        <div v-if='showing'
          class='left-wrapper' 
        >
          <span v-for='btn in leftButtons'
            class='btn left floating-btn'
            :key='btn.icon'
            :style='`background-color: ${btn.backColor}`'
            @click='btn.click'
          >
            <i :class='`icon txt pointer fas fa-${btn.icon}`' :style='{color: btn.iconColor}'></i>
          </span>
        </div>
      </transition>
      <transition name='top-trans'>
        <div v-if='showing'
          class='top-wrapper'>
          <span v-for='btn in topButtons'
            class='btn top floating-btn'
            :key='btn.icon'
            :style='`background-color: ${btn.backColor}`'
            @click='btn.click'
          >
            <i :class='`icon txt pointer fas fa-${btn.icon}`' :style='{color: btn.iconColor}'></i>
          </span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State } from 'vuex-class'

import { FloatingButton } from '@/interfaces/app'

import Sortable from 'sortablejs'

@Component
export default class ActionButtonComp extends Vue {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void

  leftButtons: FloatingButton[] = [
  ]
  topButtons: FloatingButton[] = [
    {icon: 'bolt', iconColor: 'white', backColor: '#FFE366', click: this.popUp('TaskadderPopup')},
    {icon: 'tags', iconColor: 'white', backColor: '#FF6B66', click: this.popUp('LabeladderPopup')},
    {icon: 'layer-group', iconColor: 'white', backColor: '#6b66ff', click: this.popUp('PerspectiveAdderPopup')},
  ]
  showing: boolean = false

  mounted() {
    this.mount()
  }

  mount() {
    const el = document.getElementById('floating-btn')
    const sort = new Sortable(el, {
      disabled: false,
      group: {name: 'floatbutton', pull: 'clone', put: false},
      animation: 150,
    })
  }
  popUp(compName: string): () => void {
    return () => {
      this.pushPopUp(compName)
    }
  }
}

</script>

<style scoped>

.left-wrapper, .top-wrapper {
  display: flex;
  align-items: center;
}

.wrapper {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 50;
  pointer-events: none;
  z-index: 999;
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

.left-wrapper {
  position: absolute;
  height: 45px;
  bottom: 16px;
  right: 70px;
  flex-direction: row-reverse;
}

.top-wrapper {
  position: absolute;
  width: 45px;
  bottom: 70px;
  right: 16px;
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

.floating-btn {
  transition: filter .2s, transform .2s;
}

.floating-btn:hover {
  transform: scale(1.05, 1.05);
  filter: brightness(1.1);
}

.btn.left {
  margin: 0 6px;
}

.btn.top {
  margin: 6px 0;
}

.below-trans-enter-active {
  transition: bottom .3s ease-in;
}

.below-trans-leave-active {
  transition: bottom .3s ease-out;
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
