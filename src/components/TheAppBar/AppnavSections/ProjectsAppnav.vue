<template>
  <div>
    <appnav-header
      name='PROJECTS'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <appnav-message @click="pushPopUp('PerspectiveAdderPopup')" name='Add project'/>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, Perspective, Task, ListIcon, ListElement } from '@/interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState } from '../../../interfaces/store/task'
import { SetState } from '../../../interfaces/store/settings'

const persVuex = namespace('perspective')
const taskVuex = namespace('task')
const set = namespace('settings')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: IndexState.viewName
  @State viewType!: IndexState.viewType
  @Mutation openSection!: IndexMutations.OpenSection

  @persVuex.Getter pinedSmartPerspectives!: PersGetters.PinedSmartPerspectives
  @persVuex.Getter pinedCustomPerspectives!: PersGetters.PinedCustomPerspectives
  @persVuex.Getter getNumberOfTasksByPerspectiveId!: PersGetters.GetNumberOfTasksByPerspectiveId

  @taskVuex.State tasks!: TaskState.tasks

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
