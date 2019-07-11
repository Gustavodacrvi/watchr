<template>
  <div class='settings'>
    <div class='center'>
      <div class='menu'>
      </div>
      <div class='text'>
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
  height: 100%;
  display: flex;
  justify-content: center;
}

.center {
  flex-basis: 1000px;
  margin: 0 10px;
  margin-top: 40px;
  display: flex;
}

.menu {
  flex-basis: 225px;
}

.text {
  flex-basis: 775px;
}

</style>
