<template>
  <div class='navbar'>
    <div class='left'>
    </div>
    <div class='center'>
      <router-link
        class='link txt'
        ref='Home'
        :to="{name: 'Home'}"
      >Home</router-link>
      <router-link
        class='link txt'
        ref='User'
        :to="{name: 'User'}"
      >User</router-link>
      <router-link
        class='link txt'
        ref='Settings'
        :to="{name: 'Settings'}"
      >Settings</router-link>
    </div>
    <div class='right'>
      <span>
      <icon-dropdown v-if='!isLogged'
        class='margin'
        handle='user-alt'
      >
        <div class='dual-drop-el'>
          <span class='drop-el txt'
            @click="pushPopUp('SigninPopup')">
            <i class='fa fas fa-sign-in-alt fa-sm'></i>
            Sign in
          </span>
          <hr class='thematic-break'>
          <span
            class='drop-el txt'
            @click="pushPopUp('SignupPopup')"
            >
            <i class='fa-user-plus fas fa-sm'></i>
            Sign up
          </span>
        </div>
      </icon-dropdown>
      <icon-dropdown v-else
        title='User options'
        class='margin'
        handle='user-alt'
        min-width='300px'
      >
        <span
          class='drop-el txt'
          @click='signOut'
        >
          <i class='fa-sign-out-alt fas fa-sm'></i>
          Sign out
        </span>
        <span v-if='!emailVerified'
          class='drop-el txt'
          @click='resendConfirmationEmail'
        >
          <i class='fa-paper-plane fas fa-sm'></i>
          Resend confirmation e-mail
        </span>
      </icon-dropdown>
      </span>
        <span @click='changeTheme'>
        <i class='fa-adjust fa-lg txt pointer fas icon margin' title='Change theme'></i>
        </span>
    </div>
    <div
      class='magic-line'
      :style='magicLineStyles'
    ></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch, Mixins } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import Mixin from '@/mixins/navBar'

import IconDropdown from '@/components/IconDropdown.vue'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class DesktopNavbar extends Mixins(Mixin) {
  @State theme!: string
  @State isLogged!: boolean
  @State emailVerified!: boolean
  @Mutation pushTheme!: (theme: string) => void
  @Mutation pushPopUp!: (compName: string) => void

  lineLeftPosition: string = ''
  lineWidth: string = ''

  mounted() {
    this.moveMagicLineTo(this.route)
    const RANDOM_NUMBER = 200
    setInterval(() => {
      this.moveMagicLineTo(this.route)
    }, RANDOM_NUMBER)
    window.addEventListener('resize', this.windowEventListener)
  }
  beforeDestroy() {
    window.removeEventListener('resize', this.windowEventListener)
  }

  windowEventListener() {
    this.moveMagicLineTo(this.route)
  }
  moveMagicLineTo(ref: string | undefined) {
    if (ref && this.$refs[ref]) {
      const comp: Vue = this.linkRef(ref)
      const el: HTMLElement = comp.$el as HTMLElement
      this.lineLeftPosition = el.offsetLeft + 'px'
      this.lineWidth = el.offsetWidth + 'px'
    }
  }
  changeTheme() {
    if (this.theme === 'dark')
      this.pushTheme('light')
    else
      this.pushTheme('dark')
  }
  linkRef(ref: string): Vue {
    return this.$refs[ref] as Vue
  }

  get magicLineStyles(): object {
    return {
      left: this.lineLeftPosition,
      width: this.lineWidth,
      transitionDuration: '.3s',
    }
  }
  get route(): string {
    if (this.$route.matched[0].name)
      return this.$route.matched[0].name
    return this.$route.name as string
  }

  @Watch('$route')
  onChange() {
    this.moveMagicLineTo(this.route)
  }
}

</script>

<style scoped>

.right, .center, .dual-drop-el {
  display: flex;
}

.navbar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
  z-index: 30;
}

.right {
  position: absolute;
  right: 0;
}

.center {
  position: absolute;
  width: 100%;
  justify-content: center;
}

.magic-line {
  position: absolute;
  bottom: 0;
  background-color: #fc7d7d;
  height: 2px;
  border-radius: 2px;
  box-shadow: 0 1px 1px #fc7d7d;
}

.link {
  display: inline-block;
  text-decoration: none;
  box-sizing: border-box;
  padding: 0 16px 9px 16px;
  font-size: 1.12em;
  transition: color .3s;
}

.link:hover , .router-link-active {
  color: #fc7d7d;
  text-shadow: 0 0 1px #fc7d7d;
}

.margin {
  margin-left: 30px;
}

.drop-el {
  display: block;
  padding: 12px;
  cursor: pointer;
  font-size: 1.1em;
}

.drop-el:hover, .drop-el:hover .fontawesome-icon {
  color: #fc7d7d;
}

.dual-drop-el {
  justify-content: space-around;
}

.thematic-break {
  border: .5px solid #D9D9D9;
}

.icon-dropdown .fontawesome-icon {
  margin: 6px;
}

</style>
