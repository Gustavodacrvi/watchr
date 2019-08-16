<template>
  <base-pers
    :pers-name='persName'
    :value='value'
    :base-tasks='baseTasks'
    :save-sort='!isOnOverview'

    @input="$emit('input', !value)"
  />
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'
import { namespace, State } from 'vuex-class'

const taskVuex = namespace('task')

import BasePerspective from '@/components/AppViews/Perspectives/BasePerspective.vue'

import { IndexState } from '../../../../interfaces/store/index'
import { Task } from '../../../../interfaces/app'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewAlltasks extends Vue {
  @State currentAppSection!: IndexState.currentAppSection

  @taskVuex.State tasks!: Task[]

  persName: string = 'All tasks'

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return this.tasks
  }
}

</script>
