<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar' :class='isDesktop ? "desktop" : "mobile"'>
          <the-nav-bar></the-nav-bar>
        </div>
        <transition name='fade' mode='out-in'>
          <router-view class='content' />
        </transition>
        <div class='pop-ups-wrapper' :class='{hidden: !showingPopUp}'>
          <div class='pop-ups' :class='{hidden: !showingPopUp}'>
            <transition name='fade' mode='out-in'>
              <component class='pop-up' :is='popUp'></component>
            </transition>
            <div class='popup-margin' @click='pushPopUp("")'></div>
          </div>
        </div>
        <transition name='appbar-trans'>
          <keep-alive>
            <the-app-bar v-if='appBarState'></the-app-bar>
          </keep-alive>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import TheNavbar from '@/components/TheNavbar/TheNavbar.vue'

@Component({
  components: {
    'the-nav-bar': TheNavbar,
    'SigninPopup': () => import('@/components/PopUps/SigninPopup.vue'),
    'SignupPopup': () => import('@/components/PopUps/SignupPopup.vue'),
    'the-app-bar': () => import('@/components/TheAppBar/TheAppBar.vue'),
  },
})
export default class App extends Vue {
  @State('theme') public readonly theme!: string
  @State('popUpComponent') public readonly popUp!: string
  @State('appBarState') public readonly appBarState!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean

  @Mutation('closeAppBar') public readonly closeAppBar!: () => void
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void

  get showingPopUp(): boolean {
    return this.popUp !== ''
  }
}

</script>


<style scoped>

.app-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
}

.visible {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pop-ups-wrapper {
  position: fixed;
  height: 110%;
  width: 100%;
  background-color: rgba(0, 0, 0, .2);
  transition: background-color .3s; 
  z-index: 50;
  overflow: auto;
}

.pop-ups-wrapper.hidden {
  background-color: initial;
  pointer-events: none;
}

.pop-ups {
  position: relative;
  height: 130%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pop-ups.hidden {
  height: 100%;
}

.popup-margin {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 49;
}

.pop-up {
  margin: 100px 20px 100px 20px;
  z-index: 50;
}

.navbar {
  position: relative;
  width: 100%;
  transition: flex-basis .3s;
}

.navbar.desktop {
  flex-basis: 80px;
}

.navbar.mobile {
  flex-basis: 50px;
}

.content {
  position: relative;
  flex-basis: 100%;
}

.appbar-trans-enter {
  left: -300px !important;
}

.appbar-trans-enter-to, .appbar-trans-leave-active {
  transition: left .3s !important;
}

.appbar-trans-enter-to {
  left: 0 !important;
}

.appbar-trans-leave-active {
  left: -300px !important;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
