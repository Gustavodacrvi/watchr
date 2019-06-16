<template>
  <div class='navbar'>
    <div class='left'>
    </div>
    <div class='center'>
      <router-link class='link txt' :to='{name: "Home"}' ref='Home' @click.native='moveMagicLineTo("Home")'>Home</router-link>
      <router-link class='link txt' :to='{name: "Help"}' ref='Help' @click.native='moveMagicLineTo("Help")'>Help</router-link>
      <router-link class='link txt' :to='{name: "User"}' ref='User' @click.native='moveMagicLineTo("User")'>User</router-link>
    </div>
    <div class='right'>
      <icon-dropdown class='margin' handle='user'>
        <div class='dual-drop-el'>
          <span class='drop-el txt' @click="pushPopUp('SigninPopup')"><icon icon='sign-in-alt' size='sm'></icon>Sign in</span>
          <hr class='thematic-break'>
          <span class='drop-el txt' @click="pushPopUp('SignupPopup')"><icon icon='user-plus' size='sm'></icon>Sign up</span>
        </div>
      </icon-dropdown>
      <icon class='margin' icon='adjust' @click='changeTheme'></icon>
    </div>
    <div class='magic-line' :style='magicLineStyles'></div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import FontAwesomeIcons from '@/components/FontAwesomeIcon.vue'
import IconDropdown from '@/components/IconDropdown.vue'

@Component({
  components: {
    'icon': FontAwesomeIcons,
    'icon-dropdown': IconDropdown,
  },
})
export default class DesktopNavbar extends Vue {
  @State('theme') public readonly theme!: string
  @Mutation('pushTheme') public readonly pushTheme!: (theme: string) => void
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void

  public lineLeftPosition: string = ''
  public lineWidth: string = ''

  public mounted(): void {
    setTimeout(() => {
      this.moveMagicLineTo(this.$route.name)
    }, 50)
    window.addEventListener('resize', this.windowEventListener)
  }

  public beforeDestroy(): void {
    window.removeEventListener('resize', this.windowEventListener)
  }

  public windowEventListener(): void {
    this.moveMagicLineTo(this.$route.name)
  }

  public moveMagicLineTo(ref: string | undefined): void {
    if (ref && this.$refs[ref]) {
      const comp: any = this.$refs[ref]
      const el: any = comp.$el
      this.lineLeftPosition = el.offsetLeft + 'px'
      this.lineWidth = el.offsetWidth + 'px'
    }
  }
  public changeTheme(): void {
    if (this.theme === 'dark') {
      this.pushTheme('light')
    } else {
      this.pushTheme('dark')
    }
  }
  public get magicLineStyles(): object {
    return {
      left: this.lineLeftPosition,
      width: this.lineWidth,
      transitionDuration: '.3s',
    }
  }
}

</script>

<style scoped>

.navbar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
}

.right {
  position: absolute;
  right: 0;
  display: flex;
}

.center {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
}

.magic-line {
  position: absolute;
  bottom: 0;
  background-color: #AF92F7;
  height: 2px;
  border-radius: 2px;
  box-shadow: 0 1px 1px #AF92F7;
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
  color: #AF92F7;
  text-shadow: 0 0 1px #AF92F7;
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

.drop-el:hover  {
  color: #AF92F7 !important;
}

.dual-drop-el {
  display: flex;
  justify-content: space-around;
}

.thematic-break {
  border: .5px solid #D9D9D9;
}

.icon-dropdown .fontawesome-icon {
  margin: 6px;
}

</style>
