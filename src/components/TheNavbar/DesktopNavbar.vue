<template>
  <div class='navbar'>
    <div class='left'>
    </div>
    <div class='center'>
      <router-link class='link txt' :to="{name: 'Home'}" ref='Home' @click.native="moveMagicLineTo('Home')">Home</router-link>
      <router-link class='link txt' :to="{name: 'User'}" ref='User' @click.native="moveMagicLineTo('User')">User</router-link>
      <router-link class='link txt' :to='{name: "Help"}' ref='Help' @click.native="moveMagicLineTo('Help')">Help</router-link>
    </div>
    <div class='right'>
      <icon-dropdown class='margin' handle='user-alt'>
        <div class='dual-drop-el'>
          <span class='drop-el txt' @click="pushPopUp('SigninPopup')">
            <ft-icon icon='sign-in-alt' size='sm'></ft-icon>
            Sign in
          </span>
          <hr class='thematic-break'>
          <span class='drop-el txt' @click="pushPopUp('SignupPopup')">
            <ft-icon icon='user-plus' size='sm'></ft-icon>
            Sign up
          </span>
        </div>
      </icon-dropdown>
      <ft-icon class='txt pointer icon margin' icon='adjust' @click='changeTheme' size='lg'></ft-icon>
    </div>
    <div class='magic-line' :style='magicLineStyles'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import IconDropdown from '@/components/IconDropdown.vue'

@Component({
  components: {
    'icon-dropdown': IconDropdown,
  },
})
export default class DesktopNavbar extends Vue {
  @State theme!: string
  @Mutation pushTheme!: (theme: string) => void
  @Mutation pushPopUp!: (compName: string) => void

  lineLeftPosition: string = ''
  lineWidth: string = ''

  mounted() {
    this.moveMagicLineTo(this.$route.name)
    window.addEventListener('resize', this.windowEventListener)
  }
  beforeDestroy() {
    window.removeEventListener('resize', this.windowEventListener)
  }

  windowEventListener() {
    this.moveMagicLineTo(this.$route.name)
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

.link:hover , .router-link-exact-active {
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
