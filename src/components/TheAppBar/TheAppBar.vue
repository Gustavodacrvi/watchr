<template>
  <div class='wrapper'>
    <div class='appbar gray' :class='theme'>
      <transition name='fade' mode='out-in'>
        <component class='theappbar' :is='appMenu' @change='changeMenu' @theme='changeTheme'></component>
      </transition>
    </div>
    <div class='appbar-margin' @click='closeAppBar'></div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

@Component({
  components: {
    DesktopAppbar: () => import('@/components/TheAppBar/DesktopAppbar.vue'),
    NotloggedSettings: () => import('@/components/TheAppBar/NotloggedSettings.vue'),
    NotloggedAppnav: () => import('@/components/TheAppBar/NotloggedAppnav.vue'),
    LoggedAppnav: () => import('@/components/TheAppBar/LoggedAppnav.vue'),
    LoggedSettings: () => import('@/components/TheAppBar/LoggedSettings.vue'),
  },
})
export default class TheNavBar extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('isStandAlone') public readonly isStandAlone!: boolean
  @Mutation('pushTheme') public readonly pushTheme!: (theme: string) => void
  @Mutation('closeAppBar') public readonly closeAppBar!: () => void

  public settings: boolean = !this.isStandAlone
  public appMenu: string = ''

  public created() {
    this.settings = !this.isStandAlone

    if (this.isDesktop) {
      this.appMenu = 'desktop'
    } else if (!this.isLogged && !this.settings) {
      this.appMenu = 'NotloggedAppnav'
    } else if (!this.isLogged && this.settings) {
      this.appMenu = 'NotloggedSettings'
    } else if (this.isLogged && !this.settings) {
      this.appMenu = 'LoggedAppnav'
    } else if (this.isLogged && this.settings) {
      this.appMenu = 'LoggedSettings'
    }
  }

  public changeTheme(): void {
    if (this.theme === 'dark') {
      this.pushTheme('light')
    } else {
      this.pushTheme('dark')
    }
  }

  public changeMenu(compName: string): void {
    this.appMenu = compName
  }
}

</script>

<style scoped>

.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
}

.appbar {
  flex-basis: 300px;
}

.appbar-margin {
  flex-grow: 1;
}

.theappbar {
  position: relative;
  height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

</style>
