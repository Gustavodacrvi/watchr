<template>
  <base-pers v-if='perspectiveData'
    :pers-name='pers'
    :base-tasks='baseTasks'
    :save='true'
    :save-sort='!isOnOverview'
  />
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace, Getter, Mutation, State } from 'vuex-class'

const taskVuex = namespace('task')
const persVuex = namespace('perspective')

import BasePerspective from '@/components/AppViews/Perspectives/BasePerspective.vue'

import appUtils from '@/utils/app'

import { Task, Perspective } from '../../../interfaces/app'
import { IndexState, IndexMutations } from '../../../interfaces/store/index'
import { PersGetters } from '../../../interfaces/store/perspective'
import { TaskState } from '../../../interfaces/store/task'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class CustomPerspectives extends Vue {
  @State currentAppSection!: IndexState.currentAppSection
  @Mutation pushView!: IndexMutations.PushView

  @persVuex.Getter getPerspectiveByName!: PersGetters.GetPerspectiveByName

  @taskVuex.State tasks!: TaskState.tasks

  @Prop(String) pers!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get perspectiveData() {
    return this.getPerspectiveByName(this.pers)
  }
  get baseTasks() {
    return this.tasks
  }
}

</script>
