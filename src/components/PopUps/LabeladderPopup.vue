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
import { State, Getter, Mutation, namespace } from 'vuex-class'

import labelUtil from '@/utils/label'

import { Label } from '../../interfaces/app'
import { Alert } from '../../interfaces/alert'

const labelModule = namespace('label')

@Component
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: string
  @Mutation('pushAlert') public readonly pushAlert!: (alert: Alert) => void
  // tslint:disable-next-line:max-line-length
  @labelModule.Getter('getLabelNodeFromArrayPath') public readonly  getLabelNodeFromArrayPath!: (path: string[]) => Label | undefined

  public value: string = ''

  public keyPressed({key}: {key: string}): void {
    if (key === 'Enter') {
      this.addLabel()
    }
  }
  public addLabel(): void {
    const label: Label | undefined = this.getLabelNodeFromArrayPath(labelUtil.getArrFromStringPath(this.value))
    if (label !== undefined) {
      this.pushAlert({
        name: `<strong>${this.value}</strong> already exists.`,
        duration: 2.5,
        type: 'error',
      })
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
