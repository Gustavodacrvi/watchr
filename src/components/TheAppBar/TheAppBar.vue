<template>
  <div
    class='wrapper'
    :class='[platform, {zindex: activeZindex && !isDesktop}]'
  >
    <div
      class='appbar'
      :class='platform'
    >
      <transition
        name='fade'
        mode='out-in'
      >
        <component
          class='theappbar'
          :class='theme'
          :is='appMenu'
          @change='changeMenu'
          @theme='changeTheme'
          @close='closeAppBar'
        ></component>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

import appUtils from '@/utils/app'
import { IndexState, IndexMutations, IndexGetters } from '../../interfaces/store/index'

@Component({
  components: {
    appnav: appUtils.AsyncComponent(import(/* webpackChunkName: "appnav-app" */ './Appnav.vue')),
    settingsnav: appUtils.AsyncComponent(/* webpackChunkName: "appnav-settings" */ import('./Settingsnav.vue')),
  },
})
export default class TheNavBar extends Vue {
  @State theme!: IndexState.theme
  @State appBarState!: IndexState.appBarState
  @State isLogged!: IndexState.isLogged
  @State emailVerified!: IndexState.emailVerified
  @Mutation pushTheme!: IndexMutations.PushTheme
  @Mutation closeAppBar!: IndexMutations.CloseAppBar
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter loggedAndVerified!: IndexGetters.LoggedAndVerified
  @Getter platform!: IndexGetters.Platform
  @Getter isStandAlone!: IndexGetters.IsStandAlone

  appMenu: 'settingsnav' | 'appnav' = 'appnav'
  activeZindex: boolean = true

  created() {
    if ((this.isDesktop || this.isStandAlone) && this.loggedAndVerified)
      this.appMenu = 'appnav'
    else
      this.appMenu = 'settingsnav'
  }

  changeTheme() {
    if (this.theme === 'dark')
      this.pushTheme('light')
    else
      this.pushTheme('dark')
  }
  changeMenu() {
    if (this.appMenu === 'appnav')
      this.appMenu = 'settingsnav'
    else
      this.appMenu = 'appnav'
  }

  @Watch('isLogged')
  onAuthChange() {
    if (!this.loggedAndVerified)
      this.appMenu = 'settingsnav'
    else this.appMenu = 'appnav'
  }
  @Watch('appBarState')
  onChange() {
    if (this.appBarState)
      this.activeZindex = true
    else setTimeout(() => {
      this.activeZindex = false
    }, 300)
  }
  @Watch('isDesktop')
  onChange3() {
    if (this.isDesktop)
      this.appMenu = 'appnav'
  }
}

</script>

<style scoped>

.wrapper {
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 35;
}

.wrapper.desktop {
  width: 305px;
}

.wrapper.mobile {
  width: 100%;
}

.zindex {
  z-index: 950;
}

.appbar {
  width: 280px;
}

.appbar.mobile {
  width: 100%;
}

.appbar-margin {
  flex-grow: 1;
}

.theappbar {
  position: relative;
  height: 100%;
  flex-direction: column;
}

</style>
