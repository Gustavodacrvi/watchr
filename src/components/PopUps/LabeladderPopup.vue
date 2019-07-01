<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        @value='v => value = v'
        :input='input'
        @update='getOptions'
        @select='selectValue'
      ></dropdown-input>
      <button
        tabindex='2'
        class='button round-border margin'
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

import DropdownInput from '@/components/DropdownInput.vue'

import labelUtil from '@/utils/label'

import { Alert } from '../../interfaces/app'

const labelModule = namespace('label')

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

  input: string | null = null
  MAXIMUM_LENGTH_OF_LABEL_TREE: number = 4
  value: string = ''
  options: string[] = []

  created() {
    this.input = this.popUpPayload
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
