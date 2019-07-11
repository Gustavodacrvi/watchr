<template>
  <div class='settings'>
    <div class='center'>
      <div class='menu'>
        <div class='txt'>About</div>
        <div class='txt'>General</div>
        <div class='txt'>Privacy policy</div>
        <div class='txt'>Security policy</div>
        <div class='txt'>Terms of service</div>
      </div>
      <div class='text txt'>
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Help extends Vue {}

</script>

<style scoped>

.settings {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
}

.center {
  flex-basis: 1000px;
  margin: 0 10px;
  margin-top: 60px;
  display: flex;
}

.menu {
  flex-basis: 225px;
}

.text {
  flex-basis: 775px;
  text-align: justify;
  text-justify: inter-word;
}

</style>
