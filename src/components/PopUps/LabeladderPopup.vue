<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <input tabindex='1' class='input gray round-border txt margin' type='text' autocomplete='off' :class='theme' v-model='value' @keypress='keyPressed' />
      <button tabindex='2' class='button round-border margin' @click='add'>Add label</button>
      <span v-show='isDesktop' class='margin txt'>You can open this pop up at any time by clicking the 'L' key.</span><br>
      <span v-show='isDesktop' class='margin txt'>You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

import labelUtil from '@/utils/label'

import { Label } from '../../interfaces/app'
import { Alert } from '../../interfaces/alert'

const labelModule = namespace('label')

@Component
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: string
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Mutation('pushAlert') public readonly pushAlert!: (alert: Alert) => void
  // tslint:disable-next-line:max-line-length
  @labelModule.Mutation('addLabelFromArrayPath') public readonly addLabelFromArrayPath!: (path: string[]) => void
  // tslint:disable-next-line:max-line-length
  @labelModule.Getter('getLabelNodeFromArrayPath') public readonly  getLabelNodeFromArrayPath!: (path: string[]) => Label | undefined

  public value: string = ''

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter') {
      this.add()
    }
  }
  public add(): void {
    const arr = labelUtil.getArrFromStringPath(this.value)
    const label: Label | undefined = this.getLabelNodeFromArrayPath(arr)
    if (label !== undefined) {
      this.pushAlert({
        name: `<strong>${this.value}</strong> already exists.`,
        duration: 2.5,
        type: 'error',
      })
    } else if (arr.length > 4) {
      this.pushAlert({
        name: 'The maximum number of subtasks is 4',
        duration: 2.5,
        type: 'error',
      })
    } else {
      this.addLabelFromArrayPath(arr)
      this.pushAlert({
        name: `<strong>${this.value}</strong> was successfully added`,
        duration: 2.5,
        type: 'success',
      })
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
