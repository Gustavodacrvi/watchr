<template>
  <div class='navbar-wrapper' :class='isDesktop ? "desktop" : "mobile"'>
    <desktop v-if='isDesktop'></desktop>
    <keep-alive>
      <mobile v-if='!isDesktop'></mobile>
    </keep-alive>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import LoadingComponent from '@/components/LoadingComponent.vue'
import ErrorComponent from '@/components/ErrorComponent.vue'

const AsyncComponent = (compPath: string): any => () => ({
  component: import(`${compPath}`),
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 200,
  timeout: 5000,
})

@Component({
  components: {
    desktop: AsyncComponent('@/components/TheNavbar/DesktopNavbar.vue'),
    mobile: AsyncComponent('@/components/TheNavbar/MobileNavbar.vue'),
  },
})
export default class TheNavbar extends Vue {
  @Getter isDesktop!: boolean
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
