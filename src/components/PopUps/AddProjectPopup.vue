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

const proVuex = namespace('project')

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
  @Mutation pushAlert!: IndexMutations.PushAlert

  @proVuex.Getter sortedFoldersByName!: ProjectGetters.SortedFoldersByName
  @proVuex.Getter sortedProjectsByName!: ProjectGetters.SortedProjectsByName
  @proVuex.Action addProject!: ProjectActions.AddProject
  @proVuex.Action editProject!: ProjectActions.EditProject

  value: string = ''
  description: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.projectadder')[0] as any
    el.focus()
    const p = this.popUpPayload
    if (p && !p.editing)
      this.value += p + ':'
    else if (p && p.editing) {
      const pro = this.sortedProjectsByName.find(e => e.id === p.id)
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
        this.pushAlert({
          name: `Project <strong>${this.value}</strong> successfully added!`,
          duration: 2,
          type: 'success',
        })
      } else if (!pro)
        this.pushAlert({
          name: `Another project with the name <strong>${project}</strong> already exists!`,
          duration: 3,
          type: 'error',
        })
    } else if (this.value && this.isEditing) {
      const p = this.popUpPayload as any
      const pro = this.sortedProjectsByName.find(el => el.name === this.value)
      let edit = false
      if (this.value !== p.name && !pro) edit = true
      if (edit) {
        this.editProject({
          id: p.id,
          name: this.value,
          description: this.description,
        })
        this.pushPopUp('')
        this.pushAlert({
          name: `Project ${this.value} successfully edited!`,
          duration: 2,
          type: 'success',
        })
      } else if (this.value === p.name)
        this.pushAlert({
          name: `Another project with the name ${this.value} already exists!`,
          duration: 3,
          type: 'error',
        })
    }
  }
  getOptions(): string[] {
    const {folder, project} = this.getInput

    if (project === null)
      return this.sortedFoldersByName.filter(el => el.name.includes(this.value)).map(el => el.name)
    else
      return this.sortedProjectsByName.filter(el => el.name.includes(project)).map(el => el.name)
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
    let pro: null | string = ''
    if (split.length === 0) pro = null
    split.forEach(el => pro += el)
    return {folder, project: pro}
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
