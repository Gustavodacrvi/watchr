<template>
  <base-pers
    :pers-name='persName'
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

import appUtils from '@/utils/app'

import { Task } from '../../../../interfaces/app'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewDoesntAlltasks extends Vue {
  @State currentAppSection!: string

  @taskVuex.State tasks!: Task[]

  persName: string = `Doesn't have tags`

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return appUtils.filterTasksBySmartPerspective(this.persName, this.tasks)
  }
}

</script>
