<template>
  <div class='app-wrapper'>
    <div class='app background-color' :class='theme'>
      <div class='visible'>
        <div class='navbar'></div>
        <div class='content'></div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class App extends Vue {
  @State('theme') private theme!: string
}

</script>


<style>

body {
  margin: 0;
}

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
  width: 100%;
  flex-basis: 60px;
}

.content {
  flex-basis: 100%;
}

</style>

<style>

@import 'assets/css/global.css'

</style>
