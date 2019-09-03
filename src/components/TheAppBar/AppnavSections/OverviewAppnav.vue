<template>
  <div>
    <appnav-header
      name='OVERVIEW'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <div v-if='smartPers && smartPers.length > 0'>
      <list-renderer
        group='appnavoverview'
        route='pers'
        :disabled='true'
        :list='smartPers'
        :active='activePers'
      />
      <div class='margin'></div>
    </div>
    <div v-if='customPers && smartPers.length > 0'>
      <list-renderer
        group='appnavoverviewcustompers'
        route='pers'
        :disabled='true'
        :list='customPers'
        :active='activePers'
      />
      <div class='margin'></div>
    </div>
    <project-renderer
      group='appnavdivisionprojectsoverview'
      :list='getPinedProjects'
      :active='""'
      :disabled='true'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavRenderer from '@/components/TheAppBar/AppnavComponents/ListAppnavdivision.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, Perspective, Task, ListIcon, ListElement, AppnavDivisionEl } from '@/interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState } from '../../../interfaces/store/task'
import { SetState } from '../../../interfaces/store/settings'
import { ProjectGetters } from '../../../interfaces/store/project'

const persVuex = namespace('perspective')
const taskVuex = namespace('task')
const project = namespace('project')
const set = namespace('settings')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
    'project-renderer': AppnavRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: IndexState.viewName
  @State viewType!: IndexState.viewType
  @Mutation openSection!: IndexMutations.OpenSection

  @project.Getter sortedFolders!: ProjectGetters.SortedFolders
  @project.Getter getPinedProjectsByFolderId!: ProjectGetters.GetPinedProjectsByFolderId

  @persVuex.Getter pinedSmartPerspectives!: PersGetters.PinedSmartPerspectives
  @persVuex.Getter pinedCustomPerspectives!: PersGetters.PinedCustomPerspectives
  @persVuex.Getter getNumberOfTasksByPerspectiveId!: PersGetters.GetNumberOfTasksByPerspectiveId

  @taskVuex.State tasks!: TaskState.tasks

  @set.State timeZone!: SetState.timeZone

  @Prop(String) search!: string

  created() {
    this.openSection('overview')
  }

  get smartPers(): ListElement[] {
    const els: ListElement[] = []
    const pers = this.pinedSmartPerspectives.filter(el => el.name.includes(this.search))
    for (const per of pers) {
      let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks, this.timeZone)
      let show = true
      if (per.showWhenNotEmpty && numberOfTasks === 0)
        show = false
      if (!per.numberOfTasks)
        numberOfTasks = 0
      els.push({
        ...per, show, number: numberOfTasks,
      })
    }
    return els
  }
  get customPers(): ListElement[] {
    const els: ListElement[] = []
    const pers = this.pinedCustomPerspectives.filter(el => el.name.includes(this.search))
    for (const per of pers) {
      let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks, this.timeZone)
      let show = true
      if (per.showWhenNotEmpty && numberOfTasks === 0)
        show = false
      if (!per.numberOfTasks)
        numberOfTasks = 0
      els.push({
        ...per, show, number: numberOfTasks,
      })
    }
    return els
  }
  get activePers(): string {
    if (this.viewType === 'perspective')
      return this.viewName
    return ''
  }
  get getPinedProjects(): AppnavDivisionEl[] {
    const arr: AppnavDivisionEl[] = []
    for (const fold of this.sortedFolders) {
      const pros = this.getPinedProjectsByFolderId(fold.id)
      if (pros.length > 0) {
        const list = []
        for (const p of pros)
          list.push({
            ...p,
            number: 0,
            show: true,
          })
        arr.push({
          name: fold.name,
          id: fold.id,
          list,
        })
      }
    }
    return arr
  }
}

</script>

<style scoped>

.margin {
  height: 30px;
}

</style>
