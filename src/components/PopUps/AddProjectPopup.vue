<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>Add Project</h2>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='projectadder'
        placeholder='Project name...'
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
      >Add project</button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace } from 'vuex-class'

const project = namespace('project')

import DropInput from '@/components/DropdownInput.vue'

import { IndexState } from '../../interfaces/store/index'
import { ProjectGetters, ProjectActions } from '../../interfaces/store/project'

@Component({
  components: {
    'dropdown-input': DropInput,
  },
})
export default class ProjectPopup extends Vue {
  @State theme!: IndexState.theme
  @State popUpPayload!: IndexState.popUpPayload

  value: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.projectadder')[0] as any
    el.focus()
    if (this.popUpPayload) {
      this.value += this.popUpPayload + ':'
    }
  }

  add() {
    if (this.value) {

    }
  }
  getOptions(): string[] {
    return []
  }
  select(val: string) {
    this.value = val
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
