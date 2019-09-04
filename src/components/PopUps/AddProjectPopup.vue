<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>{{ projectTitle }}</h2>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='projectadder'
        :placeholder='dropdownInput'
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
      >{{ btnMsg }}</button>
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
export default class ProjectPopup extends Vue {
  @State theme!: IndexState.theme
  @State popUpPayload!: any
  @Mutation pushPopUp!: IndexMutations.PushPopUp

  @project.Getter sortedFoldersByName!: ProjectGetters.SortedFoldersByName
  @project.Getter sortedProjectsByName!: ProjectGetters.SortedProjectsByName
  @project.Action addProject!: ProjectActions.AddProject
  @project.Action editProject!: ProjectActions.EditProject

  value: string = ''
  description: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.projectadder')[0] as any
    el.focus()
    const p = this.popUpPayload
    if (p && !p.editing) {
      this.value += p + ':'
    } else if (p && p.editing) {
      const pro = this.sortedProjectsByName.find(el => el.id === p.id)
      if (pro) {
        this.value = pro.name
        this.description = pro.description
      }
    } else this.value = ''
  }

  add() {
    if (this.value && !this.isEditing) {
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
    } else if (this.value && this.isEditing) {
      const p = this.popUpPayload as any
      const pro = this.sortedProjectsByName.find(el => el.name === this.value)
      let edit = true
      if (this.value !== p.name && !pro) edit = false
      if (edit) {
        this.editProject({
          id: p.id,
          name: this.value,
          description: this.description,
        })
        this.pushPopUp('')
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
  get isEditing(): boolean {
    return this.popUpPayload && this.popUpPayload.editing
  }
  get projectTitle(): string {
    if (this.isEditing) return 'Edit project'
    return 'Add project'
  }
  get dropdownInput(): string {
    if (this.isEditing) return 'Project name...'
    return 'Project name...'
  }
  get btnMsg(): string {
    if (this.isEditing) return 'Save project'
    return 'Add project'
  }

  @Watch('value')
  onChange() {
    this.options = this.getOptions()
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
