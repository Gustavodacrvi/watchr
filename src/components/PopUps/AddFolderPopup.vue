<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>Add Project Folder</h2>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='folderadder'
        placeholder='Folder name...'
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
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { State, Mutation, namespace } from 'vuex-class'

const project = namespace('project')

import { IndexState } from '../../interfaces/store/index'

@Component
export default class SigninPopUp extends Vue {
  @State theme!: IndexState.theme

  @project.State folders!: ProjectState.folders

  value: string | null = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.folderadder')[0] as any
    el.focus()
  }
  getOptions(): string[] {

  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
