<template>
  <div class='navbar-wrapper'>
    <div class='navbar'>
      <div class='left'>
      </div>
      <div class='center'>
        <template v-for='link in links'>
          <router-link v-if='!link.private' class='link txt non-private' :key='link.route' :to='link.route' :ref='link.route' @click.native='moveMagicLine(link.route)'>{{ link.name }}</router-link>
          <span v-else :key='link.route' class='link txt faded private'>{{ link.name }}</span>
        </template>
      </div>
      <div class='right'>
      </div>
      <div class='magic-line' :style='magicLineStyles'></div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class TheNavbar extends Vue {
  public links: object[] = [
    {name: 'Home', route: '/'},
    {name: 'User', route: '/user', private: true},
    {name: 'Guest', route: '/guest'},
    {name: 'Help', route: '/help'},
  ]
  public lineLeftPosition: string = '0px'
  public lineWidth: string = '0px'

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
  padding: 0 30px;
}

.navbar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
}

.left {
  float: left;
  clear: left;
}

.right {
  float: right;
  clear: right;
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
  margin-top: 7px;
  display: inline-block;
  text-decoration: none;
  box-sizing: border-box;
  padding: 0 12px 9px 12px;
  font-size: 1.12em;
  transition: color .3s;
}

.link:hover.private, .router-link-exact-active {
  color: #A97CFC;
  text-shadow: 0 0 1px #A97CFC;
}

</style>
