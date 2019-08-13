<template>
  <base-pers
    pers-name='All tasks'
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

import { Task } from '../../../../interfaces/app'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewAlltasks extends Vue {
  @State currentAppSection!: string

  @taskVuex.State tasks!: Task[]

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return this.tasks
  }
}

</script>
