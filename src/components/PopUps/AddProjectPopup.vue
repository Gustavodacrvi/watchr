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
        placeholder='Folder:project...'
        :input='value'
        :values='options'
        @enter='add'
        @value='v => value = v'
        @select='select'
        @focus='options = getOptions()'
      />
      <textarea
        tabindex='2'
        class='margin gray round-border input textarea txt scroll gray dark'
        placeholder='Project description...'
        v-model='description'
        style='height: 100px;'
      ></textarea>
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

  @project.Getter sortedFoldersByName!: ProjectGetters.SortedFoldersByName
  @project.Getter sortedProjectsByName!: ProjectGetters.SortedProjectsByName
  @project.Action addProject!: ProjectActions.AddProject

  value: string = ''
  description: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.projectadder')[0] as any
    el.focus()
    if (this.popUpPayload) {
      this.value += this.popUpPayload + ':'
    } else this.value = ''
  }

  add() {
    if (this.value) {
      const {folder, project} = this.getInput
      const pro = this.sortedProjectsByName.find(el => el.name === project)
      const fold = this.sortedFoldersByName.find(el => el.name === folder)
      if (fold && !pro && project) {
        this.addProject({
          name: project,
          foldId: fold.id,
          description: this.description,
        })
      }
    }
  }
  getOptions(): string[] {
    const {folder, project} = this.getInput

    if (project === null) {
      return this.sortedFoldersByName.filter(el => el.name.includes(this.value)).map(el => el.name)
    } else {
      return this.sortedProjectsByName.filter(el => el.name.includes(project)).map(el => el.name)
    }
  }
  select(val: string) {
    const {folder, project} = this.getInput
    if (project === null)
      this.value = val
    else this.value = folder + ':' + val
  }

  get getInput(): {folder: string, project: string | null} {
    const split = this.value.split(':')
    const folder = split[0]
    split.shift()
    let project: null | string = ''
    if (split.length === 0) project = null
    split.forEach(el => project += el)
    return {folder, project}
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
