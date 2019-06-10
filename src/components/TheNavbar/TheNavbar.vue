<template>
  <div class='navbar-wrapper'>
    <desktop></desktop>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    desktop: () => import('@/components/TheNavbar/DesktopNavbar.vue'),
  },
})
export default class TheNavbar extends Vue {}

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
