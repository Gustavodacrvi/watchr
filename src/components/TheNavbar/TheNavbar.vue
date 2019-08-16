<template>
  <div class='navbar-wrapper' :class='platform'>
    <desktop v-if='isDesktop'></desktop>
    <keep-alive>
      <mobile v-if='!isDesktop'></mobile>
    </keep-alive>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import appUtils from '@/utils/app'
import { IndexGetters } from '../../interfaces/store/index'

@Component({
  components: {
    desktop: appUtils.AsyncComponent(import(/* webpackChunkName: "desktop-navbar" */ './DesktopNavbar.vue')),
    mobile: appUtils.AsyncComponent(import(/* webpackChunkName: "mobile-navbar" */ './MobileNavbar.vue')),
  },
})
export default class TheNavbar extends Vue {
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Getter platform!: IndexGetters.Platform
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
  padding-top: 5px;
  transition: padding .3s;
}

.navbar-wrapper.desktop {
  padding: 0 50px;
}

.navbar-wrapper.mobile {
  padding: 0 20px;
}

</style>
