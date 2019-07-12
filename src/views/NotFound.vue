<template>
  <div>
    <div class='view'>
      <div class='cont'>
        <div class='title'>
          <h1 class='txt'>404</h1>
        </div>
        <div class='text'>
          <span class='txt'>NOT FOUND</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class NotFoundView extends Vue {}

</script>

<style scoped>

.view {
  height: 100%;
  position: relative;
}

.cont {
  margin-top: 75px;
  position: absolute;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);
}

.title {
  font-size: 4em;
  overflow: hidden;
}

.text {
  font-size: 2em;
  text-align: center;
}

h1 {
  margin: 0;
}

</style>
