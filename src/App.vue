<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <transition name='fade' mode='out-in'>
        <div key='app' v-if='!loading' class='visible'>
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
        <div key='loading' v-else class='visible loading'>
          <loading-component></loading-component>
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

import Alerts from '@/components/Alerts.vue'
import PopUp from '@/components/PopUps/PopUp.vue'
import TheNavbar from '@/components/TheNavbar/TheNavbar.vue'

const AsyncComponent = (compPath: string): any => () => ({
  component: import(/* webpackPrefetch: true */ `${compPath}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 5000,
})

@Component({
  components: {
    'loading-component': LoadingComponent,
    'the-nav-bar': TheNavbar,
    'alerts': Alerts,
    'pop-up': PopUp,
    'action-button': AsyncComponent('./components/ActionButton.vue'),
    'the-app-bar': AsyncComponent('./components/TheAppBar/TheAppBar.vue'),
  },
})
export default class App extends Vue {
  @State theme!: string
  @State loading!: boolean
  @State popUpComponent!: string
  @State alerts!: Alert[]
  @State appBarState!: boolean
  @State showingAlert!: boolean
  @Mutation hideAlert!: () => void
  @Mutation closeAppBar!: () => void
  @Mutation openAppBar!: () => void
  @Getter isDesktop!: boolean
  @Getter platform!: 'mobile' | 'desktop'
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Action showLastAlert!: () => void
  @Action activateKeyShortcut!: (key: string) => void

  created() {
    if (!localStorage.getItem('watchrFirstTimeIn')) {
      this.$store.dispatch('perspective/setDefaultData')
      this.$store.dispatch('label/setDefaultData')

      localStorage.setItem('watchrFirstTimeIn', 'true')
    } else {
      this.$store.commit('perspective/getSavedData')
      this.$store.commit('label/getSavedData')
    }
  }
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
    if (active && active.nodeName !== 'INPUT' && this.isOnAppRoute)
      this.activateKeyShortcut(key)
  }

  get showActionButton(): boolean {
    // tslint:disable-next-line:max-line-length
    return (this.isOnAppRoute && !this.isShowingPopUp && (this.isDesktop || !this.appBarState) && (this.loggedAndVerified || this.anonymous))
  }
  get isOnAppRoute(): boolean {
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
}

</script>


<style scoped>

.loading-component {
  position: absolute;
  z-index: 999;
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

<style src='@/assets/css/global.css'>
</style>
