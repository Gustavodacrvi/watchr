<template>
  <div class='navbar'>
    <div class='relatives'>
      <div class='left'>
        <div class='icon' @click='openAppBar();$emit("iconclick")'>
          <div class='line'></div>
          <div class='line middle'></div>
          <div class='line'></div>
        </div>
      </div>
      <div class='right'>
        <span>right</span>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation } from 'vuex-class'

@Component
export default class MobileNavbar extends Vue {
  @Mutation('openAppBar') public readonly openAppBar!: () => void
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

.icon {
  height: 25px;
  width: 30px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: height .2s;
}

.line {
  height: 5px;
  width: 100%;
  border-radius: 2px;
  background-color: #8C8C8C;
  transition: background-color .3s;
}

.middle {
  width: 65%;
}

.icon:hover {
  height: 30px;
}

.icon:hover .line {
  background-color: #AF92F7;
}

</style>
