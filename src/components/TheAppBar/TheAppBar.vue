<template>
  <div class='wrapper' :class='platform'>
    <div class='appbar gray' :class='platform'>
      <transition name='fade' mode='out-in'>
        <component class='theappbar gray' :class='theme' :is='appMenu' @change='changeMenu' @theme='changeTheme'></component>
      </transition>
    </div>
    <div v-if='!isDesktop' class='appbar-margin' @click='closeAppBar'></div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

@Component({
  components: {
    appnav: () => import('@/components/TheAppBar/Appnav.vue'),
    settingsnav: () => import('@/components/TheAppBar/Settingsnav.vue'),
  },
})
export default class TheNavBar extends Vue {
  @State theme!: string
  @Mutation pushTheme!: (theme: string) => void
  @Mutation closeAppBar!: () => void
  @Getter isDesktop!: boolean
  @Getter platform!: 'mobile' | 'desktop'
  @Getter isStandAlone!: boolean

  settings: boolean = !this.isStandAlone
  appMenu: string = ''

  created() {
    this.settings = !this.isStandAlone

    if (this.isDesktop || !this.settings)
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
}

</script>

<style scoped>

.wrapper, .theappbar {
  display: flex;
}

.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
}

.wrapper.desktop {
  width: 320px;
}

.appbar.mobile {
  flex-basis: 300px;
}

.appbar.desktop {
  width: 300px;
}

.appbar-margin {
  flex-grow: 1;
}

.theappbar {
  position: relative;
  height: 100%;
  height: 100%;
  flex-direction: column;
}

</style>
