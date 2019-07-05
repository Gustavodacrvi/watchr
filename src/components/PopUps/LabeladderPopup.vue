<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        :input='input'
        :values='options'
        @enter='add'
        @value='v => value = v'
        @select='select'
        @focus='options = getOptions()'
      ></dropdown-input>
      <button
        tabindex='2'
        class='button round-border margin'
        @click='add'
      >Add label</button>
      <span v-show='isDesktop'
        class='margin txt'
      >You can open this pop up at any time by clicking the 'L' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
      >You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'
import getUid from 'uuid'

import DropdownInput from '@/components/DropdownInput.vue'

const label = namespace('label')

import labelUtil from '@/utils/label'

import { Alert, Label } from '../../interfaces/app'

const labelModule = namespace('label')

@Component({
  components: {
    'dropdown-input': DropdownInput,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: string
  @State uid!: string
  @State popUpPayload!: any
  @Getter isDesktop!: boolean
  @Mutation pushAlert!: (alert: Alert) => void

  @label.State labels!: Label[]
  @label.Action updateLabels!: (labels: Label[]) => void

  input: string | null = null
  MAXIMUM_LENGTH_OF_LABEL_TREE: number = 4
  value: string = ''
  options: string[] = []

  created() {
    this.input = this.popUpPayload
  }

  add() {
    const arr: string[] = labelUtil.getArrFromStringPath(this.value, true)
    const newLabels: Label[] = []
    let i = 0
    let parentId = ''
    if (arr.length === 1 && arr[0] === '')
      return undefined
    if (arr.length <= 4) {
      for (const name of arr) {
        if (i === 0) {
          parentId = getUid()
          const rootLabel: Label | undefined = this.labels.find(el => el.name === name && el.level === 0)
          if (!rootLabel)
            newLabels.push({
              id: parentId,
              name,
              userId: this.uid,
              level: 0,
              subLabels: [],
            })
          else {
            parentId = rootLabel.id
            newLabels.push(rootLabel)
          }
        } else {
          const parentLabel: Label | undefined = this.labels.find(el => el.id === parentId)
          if (parentLabel) {
            const children: Label[] = this.labels.filter(el => parentLabel.subLabels.includes(el.id))
            const targetLabel: Label | undefined = children.find(el => el.name === name)
            if (!targetLabel) {
              parentId = getUid()
              newLabels.push({
                id: parentId,
                name,
                userId: this.uid,
                level: i,
                subLabels: [],
              })
            } else {
              parentId = targetLabel.id
              newLabels.push(targetLabel)
            }
          } else {
            parentId = getUid()
            newLabels.push({
              id: parentId,
              name,
              userId: this.uid,
              level: i,
              subLabels: [],
            })
          }
        }

        i++
      }
      let childId = newLabels[newLabels.length - 1].id
      for (let j = newLabels.length - 2; j >= 0; j--) {
        newLabels[j].subLabels.push(childId)
        childId = newLabels[j].id
      }
      this.updateLabels(newLabels)
    } else
      this.pushAlert({
        name: 'The height of sub-labels is 4.',
        duration: 3,
        type: 'error',
      })
  }

  getOptions(): string[] {
    const arr: string[] = labelUtil.getArrFromStringPath(this.value, false)
    if (arr.length === 1)
      return this.labels.filter(el => el.name.includes(arr[0]) && el.level === 0).map(el => el.name)
    else {
      // tslint:disable-next-line:max-line-length
      const lab: Label | undefined = this.labels.find(el => el.name === arr[arr.length - 2] && el.level === arr.length - 2)
      if (lab)
        // tslint:disable-next-line:max-line-length
        return this.labels.filter(el => lab.subLabels.includes(el.id)).filter(el => el.name.includes(arr[arr.length - 1])).map(el => el.name)
    }
    return []
  }

  select(value: string) {
    const arr: string[] = labelUtil.getArrFromStringPath(this.value, false)
    arr[arr.length - 1] = value
    this.input = labelUtil.getStringPathFromArr(arr)
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
