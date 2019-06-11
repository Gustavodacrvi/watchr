<template>
  <div class='navbar-wrapper'>
    <desktop v-if='isDesktop'></desktop>
    <h1>{{ isDesktop }}</h1>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({
  components: {
    desktop: () => import('@/components/TheNavbar/DesktopNavbar.vue'),
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
  padding: 0 50px;
  padding-top: 5px;
}

</style>
