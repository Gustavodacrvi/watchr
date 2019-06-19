<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <input tabindex='1' class='input gray round-border txt margin' type='text' autocomplete='off' :class='theme' v-model='value' @keypress='keyPressed' />
      <button tabindex='2' class='button round-border margin' @click='addLabel'>Add label</button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import label from '@/utils/label'
import { Label } from '../../interfaces/app'

const labelModule = namespace('label')

@Component
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: string
  @labelModule.Getter('getLabelNodeFromArrayPath') public readonly getLabelNodeFromArrayPath!: () => Label | undefined

  public value: string = ''

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter') {
      this.addLabel()
    }
  }
  public addLabel(): void {
    const arr = label.getArrFromStringPath(this.value)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
