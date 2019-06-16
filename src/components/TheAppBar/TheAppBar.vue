<template>
  <div class='wrapper'>
    <div class='appbar gray' :class='theme'>
      <transition name='fade' mode='out-in' tag='div'>
        <desktop v-if='desktop' key='desktop-appbar'></desktop>
        <not-logged-appnav v-else-if='!isLogged && !settings' key='mobile-appbar-notlogged'></not-logged-appnav>
        <not-logged-settings v-else-if='!isLogged && settings' key='mobile-appbar-notlogged-settingsmenu'></not-logged-settings>
        <logged-appnav v-else-if='isLogged && !settings' key='mobile-appbar-logged'></logged-appnav>
        <logged-settings v-else-if='isLogged && settings' key='mobile-appbar-logged-settingsmenu'></logged-settings>
      </transition>
    </div>
    <div class='appbar-margin' @click='closeAppBar'></div>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
    'desktop': () => import('@/components/TheAppBar/DesktopAppbar.vue'),
    'not-logged-settings': () => import('@/components/TheAppBar/NotloggedSettings.vue'),
    'not-logged-appnav': () => import('@/components/TheAppBar/NotloggedAppnav.vue'),
    'logged-appnav': () => import('@/components/TheAppBar/LoggedAppnav.vue'),
    'logged-settings': () => import('@/components/TheAppBar/LoggedSettings.vue'),
  },
})
export default class TheNavBar extends Vue {
  @State('theme') public readonly theme!: string
  @State('isLogged') public readonly isLogged!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Getter('isStandAlone') public readonly isStandAlone!: boolean
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Mutation('pushTheme') public readonly pushTheme!: (theme: string) => void
  @Mutation('closeAppBar') public readonly closeAppBar!: () => void
  public settings: boolean = !this.isStandAlone

  created() {
    this.settings = !this.isStandAlone
  }

  public changeTheme(): void {
    if (this.theme === 'dark') {
      this.pushTheme('light')
    } else {
      this.pushTheme('dark')
    }
  }

  public changeMenu(): void {
    this.settings = !this.settings
  }
}

/*
  header:
    not logged mobile, logged mobile and desktop, mobile settings section
 */

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

.content-wrapper {
  flex-basis: 100%;
}

.content {
  margin: 14px 14px 0 14px;
}

.link {
  display: block;
  text-decoration: none;
  padding: 6px 10px;
  font-size: 1.05em;
  transition: color .3s, background-color .3s;
  border-radius: 8px;
}

.link.light:hover, .router-link-exact-active.light {
  color: #AF92F7;
  background-color: #E6E6E6;
}

.link.dark:hover, .router-link-exact-active.dark {
  color: #AF92F7;
  background-color: #282828;
}

.footer-wrapper {
  flex-basis: 60px;
}

.footer {
  margin: 0 12px;
}

.border {
  width: 92%;
  border: .5px solid #D9D9D9;
  opacity: .4;
}

.left {
  float: left;
  clear: left;
}

.right {
  float: right;
  clear: right;
}

.auth-banner {
  flex-basis: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.auth-button {
  margin: 8px;
  padding: 8px 50px;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}

.auth-button.dark {
  background-color: #AF92F7;
  color: white;
  transition: background-color .3s;
}

.auth-button.dark:hover {
  background-color: #ba96fd;
}

.auth-button.light {
  background-color: #F0F0F0;
  color: #8C8C8C;
}

.auth-button.light:hover {
  color: #AF92F7;
}

.navsect {
  display: flex;
  justify-content: space-around;
}

</style>
