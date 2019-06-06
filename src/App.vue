<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar'>
          <the-nav-bar></the-nav-bar>
        </div>
        <router-view class='content' />
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TheNavbar from '@/components/TheNavbar.vue'

@Component({
  components: {
    'the-nav-bar': TheNavbar,
  },
})
export default class App extends Vue {
  @State('theme') private theme!: string
}

</script>


<style scoped>

.app-wrapper {
  position: absolute;
  height: 100%;
  width: 100%;
}

.app {
  position: relative;
  width: 100%;
  height: 100%;
}

.visible {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: relative;
  width: 100%;
  flex-basis: 60px;
}

.content {
  position: relative;
  flex-basis: 100%;
}

</style>

<style>

@import 'assets/css/global.css';

</style>
