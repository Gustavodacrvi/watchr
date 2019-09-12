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

import { IndexState, IndexMutations } from '../../interfaces/store/index'
import { ProjectGetters, ProjectActions } from '../../interfaces/store/project'

@Component({
  components: {
    'dropdown-input': DropInput,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: IndexState.theme
  @Mutation pushAlert!: IndexMutations.PushAlert

  @project.Getter sortedFoldersByName!: ProjectGetters.SortedFoldersByName
  @project.Action addFolder!: ProjectActions.AddFolder

  value: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.folderadder')[0] as any
    el.focus()
  }

  add() {
    if (this.value) {
      const fol = this.sortedFoldersByName.find(el => el.name === this.value)
      if (!fol) {
        this.addFolder(this.value)
        this.pushAlert({
          name: `Folder <strong>${this.value}</strong> successfully added!`,
          duration: 3,
          type: 'error',
        })
      } else
        this.pushAlert({
          name: `Another folder with the name <strong>${this.value}</strong> already exists!`,
          duration: 3,
          type: 'error',
        })
      this.value = ''
    }
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
