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
          <action-button v-if='showActionButton'></action-button>
        </transition>
        <div class='alert-wrapper'>
          <transition name='alert-trans' @after-leave='closeAlert'>
            <alerts v-if='showingAlert'></alerts>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action } from 'vuex-class'

import TheNavbar from '@/components/TheNavbar/TheNavbar.vue'

import { Alert } from '@/interfaces/alert'

@Component({
  components: {
    'the-nav-bar': TheNavbar,
    'alerts': () => import('@/components/Alerts.vue'),
    'pop-up': () => import('@/components/PopUps/PopUp.vue'),
    'the-app-bar': () => import('@/components/TheAppBar/TheAppBar.vue'),
    'action-button': () => import('@/components/ActionButton.vue'),
  },
})
export default class App extends Vue {
  @State('theme') public readonly theme!: string
  @State('popUpComponent') public readonly popUp!: string
  @State('alerts') public readonly alerts!: Alert[]
  @State('appBarState') public readonly appBarState!: boolean
  @State('showingAlert') public readonly showingAlert!: boolean
  @Mutation('hideAlert') public readonly hideAlert!: () => void
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('platform') public readonly platform!: 'mobile' | 'desktop'
  @Action('showLastAlert') public readonly showLastAlert!: () => void

  @Mutation('closeAppBar') public readonly closeAppBar!: () => void

  get showActionButton(): boolean {
    return this.isOnAppRoute && !this.isShowingPopUp && (this.isDesktop || !this.appBarState)
  }
  get isOnAppRoute(): boolean {
    return this.$route.name === 'User'
  }
  get isShowingPopUp(): boolean {
    return this.popUp !== ''
  }

  public closeAlert(): void {
    this.hideAlert()
    this.showLastAlert()
  }

  @Watch('alerts')
  public onAlertsChange(alerts: Alert[]): void {
    this.showLastAlert()
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

.alert-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
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

.alert-trans-enter-active, .alert-trans-leave-active {
  transition: bottom .3s !important;
} 

.alert-trans-enter, .alert-trans-leave-to {
  bottom: -100px !important;
}

.alert-trans-enter-to, .alert-trans-leave {
  bottom: 0 !important;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
