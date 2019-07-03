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
        @enter='add'
        @value='v => value = v'
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
    console.log(arr)
    let i = 0
    let parentId = ''
    for (const name of arr) {
      if (i === 0) {
        parentId = getUid()
        const rootLabel: Label | undefined = this.labels.find(el => el.name === name && el.level === 0)
        if (!rootLabel)
          newLabels.push({
            id: parentId,
            name: name,
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
        console.log(parentId)
        if (parentLabel) {
          const children: Label[] = this.labels.filter(el => parentLabel.subLabels.includes(el.id))
          const targetLabel: Label | undefined = children.find(el => el.name === name)
          if (!targetLabel) {
            parentId = getUid()
            newLabels.push({
              id: parentId,
              name: name,
              userId: this.uid,
              level: i,
              subLabels: [],
            })
          } else {
            parentId = targetLabel.id
            newLabels.push(targetLabel)
          }
        }
      }
      
      i++
    }
    console.log(newLabels)
    let childId = newLabels[newLabels.length - 1].id
    for (let i = newLabels.length - 2;i >= 0;i--) {
      if (!newLabels[i].subLabels.includes(childId))
        newLabels[i].subLabels.push(childId)
      childId = newLabels[i].id
    }
    this.updateLabels(newLabels)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
