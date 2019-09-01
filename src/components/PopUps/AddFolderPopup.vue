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

import DropInput from '@/components/DropdownInput.vue'

import { IndexState } from '../../interfaces/store/index'
import { ProjectGetters } from '../../interfaces/store/project'

@Component({
  components: {
    'dropdown-input': DropInput,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: IndexState.theme

  @project.Getter sortedFoldersByName!: ProjectGetters.SortedFoldersByName

  value: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.folderadder')[0] as any
    el.focus()
  }

  add() {
    console.log('add shit')
  }
  getOptions(): string[] {
    return this.sortedFoldersByName.filter(el => el.name.includes(this.value)).map(el => el.name)

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
