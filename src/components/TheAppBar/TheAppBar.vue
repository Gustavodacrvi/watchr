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
  @State('theme') public readonly theme!: string
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('platform') public readonly platform!: 'mobile' | 'desktop'
  @Getter('isStandAlone') public readonly isStandAlone!: boolean
  @Mutation('pushTheme') public readonly pushTheme!: (theme: string) => void
  @Mutation('closeAppBar') public readonly closeAppBar!: () => void

  public settings: boolean = !this.isStandAlone
  public appMenu: string = ''

  public created() {
    this.settings = !this.isStandAlone

    if (this.isDesktop || !this.settings) {
      this.appMenu = 'appnav'
    } else {
      this.appMenu = 'settingsnav'
    }
  }

  public changeTheme(): void {
    if (this.theme === 'dark') {
      this.pushTheme('light')
    } else {
      this.pushTheme('dark')
    }
  }

  public changeMenu(): void {
    if (this.appMenu === 'appnav') {
      this.appMenu = 'settingsnav'
    } else {
      this.appMenu = 'appnav'
    }
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

.wrapper.desktop {
  width: 320px;
}

.wrapper.mobile {
  display: flex;
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
  display: flex;
  flex-direction: column;
}

</style>
