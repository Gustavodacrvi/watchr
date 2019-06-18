<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <input class='input gray round-border txt margin' type='text' autocomplete='off' :class='theme' v-model='value' />
      <button class='button round-border margin' @click='addLabel'>Add label</button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import label from '@/utils/label'

@Component
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: string

  public value: string = ''

  public addLabel(): void {
    console.log(label.getArrFromPath(''))
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
