<template>
  <div class='navbar-wrapper' :class='isDesktop ? "desktop" : "mobile"'>
    <desktop v-if='isDesktop'></desktop>
    <mobile v-else @iconclick='$emit("iconclick")'></mobile>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({
  components: {
    desktop: () => import('@/components/TheNavbar/DesktopNavbar.vue'),
    mobile: () => import('@/components/TheNavbar/MobileNavbar.vue'),
  },
})
export default class TheNavbar extends Vue {
  @Getter('isDesktop') public readonly isDesktop!: boolean
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
