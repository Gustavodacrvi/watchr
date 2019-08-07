<template>
  <base-pers
    pers-name='Inbox'
    collection='smartPerspectives'
    :value='value'
    :base-tasks='baseTasks'
    :save='false'
    :save-sort='!isOnOverview'
    :allow-labels='false'
    :allow-date='false'
    :fixed-tag="{name: 'Inbox', icon: 'layer-group', backColor: '#83B7E2'}"

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
    return this.tasks.filter(el => el.labels.length === 0)
  }
}

</script>
