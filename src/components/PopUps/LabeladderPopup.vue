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

import { Label, Alert } from '../../interfaces/app'

const labelModule = namespace('label')

const MAXIMUM_LENGTH_OF_LABEL_TREE = 4

@Component({
  components: {
    'dropdown-input': DropdownInput,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @State popUpPayload!: any
  @Getter isDesktop!: boolean
  @Mutation pushAlert!: (alert: Alert) => void

  @labelModule.State labels!: Label[]
  @labelModule.Getter getLabelNodeFromArrayPath!: (path: string[]) => Label | undefined
  @labelModule.Action addLabelFromArrayPath!: (path: string[]) => void

  input: string | null = null
  value: string = ''
  options: string[] = []

  created() {
    this.input = this.popUpPayload
  }

  add() {
    if (this.value !== '') {
      const arr: string[] = labelUtil.getArrFromStringPath(this.value)
      const label: Label | undefined = this.getLabelNodeFromArrayPath(arr)
      if (label !== undefined)
        this.pushAlert({
          name: `<strong>${this.value}</strong> already exists.`,
          duration: 2.5,
          type: 'error',
        })
      else if (arr.length > MAXIMUM_LENGTH_OF_LABEL_TREE)
        this.pushAlert({
          name: 'The maximum number of subtasks is 4',
          duration: 2.5,
          type: 'error',
        })
      else {
        this.addLabelFromArrayPath(arr)
        this.pushAlert({
          name: `<strong>${this.value}</strong> was successfully added`,
          duration: 2.5,
          type: 'success',
        })
      }
    }
  }
  getOptions() {
    const arr: string[] = labelUtil.getArrFromStringPath(this.value, false)
    let labels: Label[] = this.labels
    const search: string = arr[arr.length - 1]
    if (arr.length > 1) {
      arr.pop()
      const label: Label | undefined = this.getLabelNodeFromArrayPath(arr)
      if (label !== undefined)
        labels = label.subLabels
    }
    const names: string[] = labels.map((el: Label) => el.name)
    this.options = names.filter((el: string) => el.includes(search))
  }
  selectValue(value: string) {
    const arr: string[] = labelUtil.getArrFromStringPath(this.value)
    arr.push(value)
    this.input = labelUtil.getStringPathFromArr(arr)
  }

  @Watch('value')
  onChange() {
    this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
