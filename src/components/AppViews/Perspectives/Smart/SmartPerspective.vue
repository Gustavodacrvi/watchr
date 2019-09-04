<template>
  <base-pers
    :pers-name='persName'
    :base-tasks='baseTasks'
    :fixed-tag="{name: persName, icon: 'layer-group', backColor: '#6b66ff'}"
    :calendar-renderer='calendarRenderer'
  />
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { namespace, State } from 'vuex-class'

const taskVuex = namespace('task')
const set = namespace('settings')

import BasePerspective from '@/components/AppViews/Perspectives/BasePerspective.vue'

import appUtils from '@/utils/app'

import { IndexState } from '../../../../interfaces/store/index'
import { Task } from '../../../../interfaces/app'
import { SetState } from '../../../../interfaces/store/settings'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewToday extends Vue {
  @State currentAppSection!: IndexState.currentAppSection

  @taskVuex.State tasks!: Task[]

  @set.State timeZone!: SetState.timeZone
  @set.State startOfTheWeek!: SetState.startOfTheWeek

  @Prop(String) persName!: string
  @Prop(Boolean) calendarRenderer!: boolean

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return appUtils.filterTasksBySmartPerspective(this.persName, this.tasks, this.timeZone, this.startOfTheWeek)
  }
}

</script>
