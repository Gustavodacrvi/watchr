<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <transition name='fade' mode='out-in'>
        <div key='error-comp' v-if='appError' class='visible loading'>
          <error-component class='waiting-component'/>
          <span class='txt another-tab'>This app is already being used in another tab.</span>
        </div>
        <div key='app' v-else-if='!loading' class='visible'>
          <div class='navbar' :class="[platform, theme, {'background-color':!isDesktop}]">
            <the-nav-bar/>
          </div>
          <div v-if='!isDesktop' style='flex-basis: 50px'></div>
          <transition name='fade' mode='out-in'>
            <router-view v-if='!isShowingPopUp || isDesktop' class='content'/>
          </transition>
          <transition name='pop-up-trans' mode='out-in'>
            <pop-up v-if='isShowingPopUp && isDesktop'/>
            <router-view style='z-index: 901' v-if='isShowingPopUp && !isDesktop'/>
          </transition>
          <transition name='appbar-trans'>
            <keep-alive>
              <the-app-bar v-if='appBarState'/>
            </keep-alive>
          </transition>
          <transition name='fade'>
            <action-button v-if='showActionButton'/>
          </transition>
          <div class='alert-wrapper'>
            <transition name='alert-trans' @after-leave='closeAlert'>
              <alerts v-if='showingAlert'/>
            </transition>
          </div>
        </div>
        <div key='loading' v-else class='visible loading'>
          <loading-component class='waiting-component'/>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import { Alert } from '@/interfaces/app'

import TheNavbar from '@/components/TheNavbar/TheNavbar.vue'
import TheAppbar from '@/components/TheAppBar/TheAppBar.vue'

import appUtils from '@/utils/app'

@Component({
  components: {
    'loading-component': LoadingComponent,
    'error-component': ErrorComponent,
    'the-nav-bar': TheNavbar,
    'the-app-bar': TheAppbar,
    // tslint:disable-next-line:max-line-length
    'alerts': appUtils.AsyncComponent(import(/* webpackPrefetch: true */'@/components/Alerts.vue')),
    // tslint:disable-next-line:max-line-length
    'pop-up': appUtils.AsyncComponent(import('@/components/PopUps/PopUp.vue')),
    'action-button': appUtils.AsyncComponent(import('@/components/ActionButton.vue')),
  },
})
export default class App extends Vue {
  @State theme!: string
  @State loading!: boolean
  @State popUpComponent!: string
  @State alerts!: Alert[]
  @State appBarState!: boolean
  @State showingAlert!: boolean
  @State isLogged!: boolean
  @State appError!: boolean
  @Mutation hideAlert!: () => void
  @Mutation resetPopUpState!: () => void
  @Mutation openAppBar!: () => void
  @Mutation pushAlert!: (alert: Alert) => void
  @Getter isDesktop!: boolean
  @Getter platform!: 'mobile' | 'desktop'
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Action showLastAlert!: () => void
  @Action activateKeyShortcut!: (key: string) => void

  mounted() {
    window.addEventListener('keypress', this.keyPressed)
  }
  beforeDestroy() {
    window.removeEventListener('keypress', this.keyPressed)
  }

  closeAlert() {
    this.hideAlert()
    this.showLastAlert()
  }
  keyPressed({key}: {key: string}) {
    const active = document.activeElement
    if (active && active.nodeName !== 'INPUT' && active.nodeName !== 'TEXTAREA' && this.isOnAppRoute)
      this.activateKeyShortcut(key)
  }

  get showActionButton(): boolean {
    // tslint:disable-next-line:max-line-length
    return (this.isOnAppRoute && !this.isShowingPopUp && (this.isDesktop || !this.appBarState) && (this.loggedAndVerified || this.anonymous))
  }
  get isOnAppRoute(): boolean {
    if (this.$route.matched[0] && this.$route.matched[0].name)
      return this.$route.matched[0].name === 'User'
    return this.$route.name === 'User'
  }
  get isShowingPopUp(): boolean {
    return this.popUpComponent !== ''
  }

  @Watch('alerts')
  onAlertsChange(alerts: Alert[]): void {
    if (!this.showingAlert)
      this.showLastAlert()
  }
  @Watch('$route')
  onRouteChange(to: any, from: any) {
    if (from.name === 'Popup')
      this.resetPopUpState()
  }
}

</script>


<style scoped>

.waiting-component {
  position: absolute;
  z-index: 998;
}

.another-tab {
  font-size: 1.3em;
}

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
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.navbar {
  position: relative;
  width: 100%;
  transition: flex-basis .3s;
  flex-shrink: 0;
}

.navbar.desktop {
  flex-basis: 80px;
}

.navbar.mobile {
  height: 50px;
  position: fixed;
  z-index: 900;
}

.navbar.mobile.light {
  box-shadow: 0 0 15px 10px #fff;
}

.navbar.mobile.dark {
  box-shadow: 0 0 15px 10px #121212;
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
  transition: bottom .4s !important;
} 

.alert-trans-enter, .alert-trans-leave-to {
  bottom: -200px !important;
}

.alert-trans-enter-to, .alert-trans-leave {
  bottom: 0 !important;
}

</style>

<style src='@/assets/css/global.css'>
</style>
