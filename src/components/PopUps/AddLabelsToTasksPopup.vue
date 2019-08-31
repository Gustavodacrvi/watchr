<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>Add Labels To Multiple Tasks</h2>
    </div>
    <div class='content'>
      <transition name='fade'>
        <view-tags v-if='selected.length > 0'
          :labels='selected'
          @removelabel='removeLabel'
        />
      </transition>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='labeladder'
        placeholder='Label name...'
        :input='value'
        :disabled='true'
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
      >Add labels to tasks</button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace } from 'vuex-class'

const label = namespace('label')

import DropdownInput from '@/components/DropdownInput.vue'
import AppviewTags from '@/components/AppViews/AppviewComponents/AppviewTags.vue'

import { IndexState } from '../../interfaces/store/index'
import { LabelState } from '../../interfaces/store/label'
import { Label } from '../../interfaces/app'

@Component({
  components: {
    'dropdown-input': DropdownInput,
    'view-tags': AppviewTags,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: IndexState.theme
  @State popUpPayload!: string[]

  @label.State labels!: LabelState.labels

  value: string = ''
  options: string[] = []
  selected: Label[] = []

  mounted() {
    const el = document.querySelectorAll('.labeladder')[0] as any
    el.focus()
  }

  add() {
    console.log(this.popUpPayload, this.selected)
  }
  select(val: string) {
    this.value = ''
    const lab = this.labels.find(el => el.name === val)
    if (lab) this.selected.push(lab)
  }
  removeLabel(id: string) {
    const i = this.selected.findIndex(el => el.id === id)
    this.selected.splice(i, 1)
  }
  getOptions() {
    return this.labels.filter(el => el.name.includes(this.value)).map(el => el.name)
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
