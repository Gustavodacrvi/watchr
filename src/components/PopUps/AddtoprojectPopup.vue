<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>Add To Project</h2>
    </div>
    <div class='content'>
      <dropdown-input
        tabindex='1'
        class='margin'
        focus-class='projectfinder'
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
      >Add to project</button>
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
  @State popUpPayload!: IndexState.popUpPayload
  @Mutation pushPopUp!: IndexMutations.PushPopUp

  @project.Getter sortedProjectsByName!: ProjectGetters.SortedFoldersByName
  @project.Action addTasksToProject!: ProjectActions.AddTasksToProject

  value: string = ''
  options: string[] = []

  mounted() {
    const el = document.querySelectorAll('.projectfinder')[0] as any
    el.focus()
  }

  add() {
    if (this.value) {
      const pro = this.sortedProjectsByName.find(el => el.name === this.value) as any
      if (pro)
        this.addTasksToProject({
          ids: this.popUpPayload as string[],
          projectId: pro.id,
        })
      this.pushPopUp('')
    }
  }
  getOptions(): string[] {
    // tslint:disable-next-line:max-line-length
    return this.sortedProjectsByName.filter(el => el.name.toLowerCase().includes(this.value.toLowerCase())).map(el => el.name)

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
