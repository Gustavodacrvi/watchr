<template>
  <base-pers
    :pers-name='pers'
    :value='value'
    :base-tasks='baseTasks'
    :save='true'

    @input="$emit('input', !value)"
  />
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace, Getter, Mutation } from 'vuex-class'

const taskVuex = namespace('task')
const persVuex = namespace('perspective')

import BasePerspective from '@/components/AppViews/Perspectives/BasePerspective.vue'

import appUtils from '@/utils/app'

import { Task, Perspective } from '../../../interfaces/app'

@Component({
  components: {
    'base-pers': BasePerspective,
  },
})
export default class ViewAlltasks extends Vue {
  @Mutation pushView!: (obj: {view: string, viewType: string}) => void

  @persVuex.Getter getperspectiveByName!: (name: string) => Perspective
  
  @taskVuex.State tasks!: Task[]

  @Prop(Boolean) value!: string
  @Prop(String) pers!: string

  get perspectiveData() {
    return this.getperspectiveByName(this.pers)
  }
  get baseTasks() {
    let tasks = this.tasks
    const pers = this.perspectiveData as Perspective
    if (pers.priority !== '')
      tasks = tasks.filter(el => el.priority === pers.priority)
    if (pers.includeAndLabels.length > 0)
      tasks = appUtils.filterTasksByLabels(tasks, pers.includeAndLabels)
    return tasks
  }
}

</script>
