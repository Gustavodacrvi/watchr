<template>
  <div class='navbar-wrapper'>
    <div class='navbar'>
      <div class='left'>
      </div>
      <div class='center'>
        <template v-for='link in links'>
          <router-link v-if='!link.private' class='link txt non-private' :key='link.route' :to='link.route' :ref='link.route' @click.native='moveMagicLine(link.route)'>{{ link.name }}</router-link>
          <span v-else :key='link.route' class='link txt faded private' :class='theme'>{{ link.name }}</span>
        </template>
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
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import FontAwesomeIcons from '@/components/FontAwesomeIcon.vue'
import IconDropdown from '@/components/IconDropdown.vue'

interface NavLinks {
  name: string
  route: string
  private?: boolean
}

@Component({
  components: {
    'icon': FontAwesomeIcons,
    'icon-dropdown': IconDropdown,
  },
})
export default class TheNavbar extends Vue {
  @State('theme') public theme!: string
  @Mutation('pushTheme') public pushTheme!: (theme: string) => void
  @Mutation('pushPopUp') public pushPopUp!: (compName: string) => void

  public links: NavLinks[] = [
    {name: 'Home', route: '/'},
    {name: 'User', route: '/user', private: true},
    {name: 'Guest', route: '/guest'},
    {name: 'Help', route: '/help'},
  ]
  public lineLeftPosition: string = ''
  public lineWidth: string = ''

  private mounted() {
    this.moveMagicLine(this.$route.path)
    window.addEventListener('resize', () => this.moveMagicLine(this.$route.path))
  }

  private moveMagicLine(ref: string): void {
    if (this.$refs[ref]) {
      const comp: any = this.$refs[ref]
      const el: any = comp[0].$el
      this.lineLeftPosition = el.offsetLeft + 'px'
      this.lineWidth = el.offsetWidth + 'px'
    }
  }
  private changeTheme(): void {
    if (this.theme === 'dark') {
      this.pushTheme('light')
    } else {
      this.pushTheme('dark')
    }
  }
  private get magicLineStyles(): object {
    return {
      left: this.lineLeftPosition,
      width: this.lineWidth,
      transitionDuration: '.3s',
    }
  }
}

</script>

<style scoped>

.navbar-wrapper, .navbar {
  display: flex;
  align-items: center;
}

.navbar-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0 50px;
  padding-top: 5px;
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
  background-color: #A97CFC;
  height: 2px;
  border-radius: 2px;
  box-shadow: 0 1px 1px #A97CFC;
}

.link {
  display: inline-block;
  text-decoration: none;
  box-sizing: border-box;
  padding: 0 16px 9px 16px;
  font-size: 1.12em;
  transition: color .3s;
}

.link:hover.non-private, .router-link-exact-active {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
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
  color: #A97CFC !important;
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
