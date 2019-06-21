<template>
  <div class='wrapper'>
    <div class='alert card round-border' :class='[theme, alert.type]'>
      <span class='txt' v-html='alert.name'></span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Alert } from '@/interfaces/alert'

@Component
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: Alert[]
  @State('alert') public readonly alert!: Alert
}

</script>

<style scoped>

.wrapper {
  display: flex;
  justify-content: center;
  position: absolute;
  pointer-events: none;
  width: 100%;
  bottom: 0;
}

.alert {
  pointer-events: all;
  margin-bottom: 25px;
  padding: 16px;
  box-sizing: border-box;
  max-width: 320px;
  display: flex;
  align-items: center;
  height: 55px;
  z-index: 100;
}

.alert.error {
  border: 1px solid #fc7d7d;
}

.alert.success {
  border: 1px solid #70FF66;
}

.alert.warning {
  border: 1px solid #FFE366;
}

</style>
