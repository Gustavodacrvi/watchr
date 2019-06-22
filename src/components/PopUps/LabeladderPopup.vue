<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <dropdown-input tabindex='1' class='margin' :values='options' @value='v => value = v' :input='input' @update='getOptions' @enter='add' @select='selectValue'></dropdown-input>
      <button tabindex='2' class='button round-border margin' @click='add'>Add label</button>
      <span v-show='isDesktop' class='margin txt'>You can open this pop up at any time by clicking the 'L' key.</span><br>
      <span v-show='isDesktop' class='margin txt'>You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

import DropdownInput from '@/components/DropdownInput.vue'

import labelUtil from '@/utils/label'

import { Label } from '../../interfaces/app'
import { Alert } from '../../interfaces/alert'

const labelModule = namespace('label')

@Component({
  components: {
    'dropdown-input': DropdownInput,
  },
})
export default class LabelAdder extends Vue {
  @State('theme') public readonly theme!: string
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Mutation('pushAlert') public readonly pushAlert!: (alert: Alert) => void
  // tslint:disable-next-line:max-line-length
  @labelModule.State('labels') public readonly labels!: Label[]
  // tslint:disable-next-line:max-line-length
  @labelModule.Getter('getLabelNodeFromArrayPath') public readonly  getLabelNodeFromArrayPath!: (path: string[]) => Label | undefined
  @labelModule.Action('addLabelFromArrayPath') public readonly addLabelFromArrayPath!: (path: string[]) => void

  public input: string | null = null
  public value: string = ''
  public options: string[] = []

  public add(): void {
    if (this.value !== '') {
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
  public getOptions(): void {
    const arr = labelUtil.getArrFromStringPath(this.value, false)
    let labels: Label[] = this.labels
    const search = arr[arr.length - 1]
    if (arr.length > 1) {
      arr.pop()
      const label = this.getLabelNodeFromArrayPath(arr)
      if (label !== undefined) {
        labels = label.subLabels
      }
    }
    const names = labels.map((el: Label) => el.name)
    console.log(search)
    this.options = names.filter((el: string) => el.includes(search))
  }
  public selectValue(value: string): void {
    const arr = labelUtil.getArrFromStringPath(this.value)
    arr.push(value)
    this.input = labelUtil.getStringPathFromArr(arr)
  }

  @Watch('value')
  public onChange(): void {
    this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
