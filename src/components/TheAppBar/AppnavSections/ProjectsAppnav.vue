<template>
  <div>
    <appnav-header
      name='PROJECTS'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <appnav-message @click='pushPopUp("AddFolderPopup")' name='Add folder'/>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'
import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'

import { Label, Perspective, Task, ListIcon, ListElement } from '@/interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState } from '../../../interfaces/store/task'
import { SetState } from '../../../interfaces/store/settings'
import { ProjectGetters } from '../../../interfaces/store/project'

const set = namespace('settings')
const project = namespace('project')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
    'appnav-message': AppnavMessage,
    'app-division': AppnavDivision,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: IndexState.viewName
  @State viewType!: IndexState.viewType
  @Mutation openSection!: IndexMutations.OpenSection
  @Mutation pushPopUp!: IndexMutations.PushPopUp

  @project.Getter sortedFolders!: ProjectGetters.SortedFolders

  @set.State timeZone!: SetState.timeZone

  @Prop(String) search!: string

  created() {
    this.openSection('overview')
  }

  get activePers(): string {
    if (this.viewType === 'project')
      return this.viewName
    return ''
  }
}

</script>
