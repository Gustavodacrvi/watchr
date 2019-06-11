<template>
  <div class='navbar'>
    <div class='relatives'>
      <div class='left'>
        <span>left</span>
      </div>
      <div class='right'>
        <span>right</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'

@Component
export default class MobileNavbar extends Vue {

}

</script>

<style scoped>

.navbar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 20px;
  display: flex;
  align-items: center;
}

.relatives {
  position: relative;
  width: 100%;
}

.left {
  float: left;
  clear: left;
}

.right {
  float: right;
  clear: right;
}

</style>
