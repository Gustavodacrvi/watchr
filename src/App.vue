<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar' :class='isDesktop ? "desktop" : "mobile"'>
          <the-nav-bar></the-nav-bar>
        </div>
        <router-view class='content' />
        <div v-show='showingPopUp' class='pop-ups-wrapper'>
          <div class='pop-ups'>
            <transition name='fade' mode='out-in'>
              <component class='pop-up' :is='popUp'></component>
            </transition>
            <div class='popup-margin' @click='pushPopUp("")'></div>
          </div>
        </div>
        <transition name='appbar-trans'>
          <div v-if='appBarState' class='appbar-wrapper'>
            <the-app-bar class='appbar'></the-app-bar>
            <div class='appbar-margin' @click='closeAppBar'></div>
          </div>
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

.popup-margin {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 49;
}

.pop-ups {
  position: relative;
  height: 130%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.pop-up {
  margin-top: 100px;
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

.appbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
}

.appbar-margin {
  flex-grow: 1;
}

.appbar {
  flex-basis: 300px;
}

.appbar-trans-enter {
  left: -300px;
}

.appbar-trans-enter-to, .appbar-trans-leave-active {
  transition: left .3s;
}

.appbar-trans-enter-to {
  left: 0;
}

.appbar-trans-leave-active {
  left: -300px;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
