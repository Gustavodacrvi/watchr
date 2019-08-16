<template>
  <base-pers
    :pers-name='persName'
    :value='value'
    :base-tasks='baseTasks'
    :fixed-tag="{name: persName, icon: 'layer-group', backColor: '#6b66ff'}"
    :save-sort='!isOnOverview'

    @input="$emit('input', !value)"
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

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewNextWeek extends Vue {
  @State currentAppSection!: IndexState.currentAppSection

  @taskVuex.State tasks!: Task[]

  @set.State startOfTheWeek!: string

  persName: string = 'Next week'

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return appUtils.filterTasksBySmartPerspective(this.persName, this.tasks, this.startOfTheWeek)
  }
}

</script>
