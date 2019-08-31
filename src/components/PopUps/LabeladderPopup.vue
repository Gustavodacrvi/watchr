<template>
  <div class='label-adder'>
    <div class='title'>
      <h3>Add label</h3>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='labeladder'
        placeholder='Label name...'
        :input='value'
        :values='options'
        @enter='add'
        @value='v => value = v'
        @select='select'
        @focus='options = getOptions()'
      />
      <button
        tabindex='2'
        class='button round-border margin'
        @click='add'
      >Add label</button>
      <span v-show='isDesktop'
        class='margin txt'
        :class='theme'
      >You can open this pop up at any time by clicking the 'L' key.</span><br>
      <span v-show='isDesktop'
        class='margin txt'
        :class='theme'
      >You can close any pop up at any time by clicking 'H' key.</span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Getter, Mutation, Action, namespace } from 'vuex-class'

import DropdownInput from '@/components/DropdownInput.vue'

const labelStore = namespace('label')

import { Alert, Label } from '../../interfaces/app'
import { IndexState, IndexGetters, IndexMutations } from '../../interfaces/store/index'
import { LabelState, LabelActions } from '../../interfaces/store/label'

@Component({
  components: {
    'dropdown-input': DropdownInput,
  },
})
export default class LabelAdder extends Vue {
  @State theme!: IndexState.theme
  @State uid!: IndexState.uid
  @State popUpPayload!: IndexState.popUpPayload
  @Getter isDesktop!: IndexGetters.IsDesktop
  @Mutation pushAlert!: IndexMutations.PushAlert

  @labelStore.State labels!: LabelState.labels
  @labelStore.Action addLabel!: LabelActions.AddLabel

  value: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.labeladder')[0] as any
    el.focus()
    setTimeout(() => {
      if (this.popUpPayload)
        this.value = this.popUpPayload
      else this.value = ''
    }, 100)
  }

  add() {
    if (this.value !== '') {
      const label: Label | undefined = this.labels.find(el => el.name === this.value)
      if (label)
        this.pushAlert({
          name: `<strong>${this.value}</strong> already exists.`,
          duration: 3,
          type: 'error',
        })
      else {
        this.addLabel(this.value)
        this.pushAlert({
          name: `<strong>${this.value}</strong> label was successfully added.`,
          duration: 2.5,
          type: 'success',
        })
        this.value = ''
      }
    }
  }

  getOptions(): string[] {
    return this.labels.filter(el => el.name.includes(this.value)).map(el => el.name)
  }

  select(value: string) {
    this.value = value
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
