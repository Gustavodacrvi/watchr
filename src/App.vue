<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar' :class='platform'>
          <the-nav-bar></the-nav-bar>
        </div>
        <transition name='fade' mode='out-in'>
          <router-view class='content' />
        </transition>
        <transition name='pop-up-trans' mode='out-in'>
          <pop-up v-if='isShowingPopUp'></pop-up>
        </transition>
        <transition name='appbar-trans'>
          <keep-alive>
            <the-app-bar v-if='appBarState'></the-app-bar>
          </keep-alive>
        </transition>
        <transition name='fade'>
          <action-button v-if='isOnAppRoute && !isShowingPopUp && !appBarState'></action-button>
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
    'pop-up': () => import('@/components/PopUps/PopUp.vue'),
    'the-app-bar': () => import('@/components/TheAppBar/TheAppBar.vue'),
    'action-button': () => import('@/components/ActionButton.vue'),
  },
})
export default class App extends Vue {
  @State('theme') public readonly theme!: string
  @State('popUpComponent') public readonly popUp!: string
  @State('appBarState') public readonly appBarState!: boolean
  @Getter('platform') public readonly platform!: 'mobile' | 'desktop'

  @Mutation('closeAppBar') public readonly closeAppBar!: () => void

  get isOnAppRoute(): boolean {
    return this.$route.name === 'User'
  }
  get isShowingPopUp(): boolean {
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

.pop-up-trans-enter-active, .pop-up-trans-leave-active {
  transition: top .3s, opacity .3s !important;
} 

.pop-up-trans-enter, .pop-up-trans-leave-to {
  top: 15px;
  opacity: 0;
}

.pop-up-trans-enter-to, .pop-up-trans-leave {
  top: 0;
  opacity: 1;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
