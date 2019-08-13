<template>
  <base-pers
    pers-name="Doesn't have tags"
    :value='value'
    :base-tasks='baseTasks'
    :allow-labels='false'
    :fixed-tag="{name: 'All tasks', icon: 'layer-group', backColor: '#6b66ff'}"
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
export default class ViewDoesntAlltasks extends Vue {
  @State currentAppSection!: string

  @taskVuex.State tasks!: Task[]

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return this.tasks.filter(el => el.labels.length === 0)
  }
}

</script>
