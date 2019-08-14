<template>
  <base-pers
    :pers-name='persName'
    :value='value'
    :base-tasks='baseTasks'
    :fixed-tag="{name: persName, icon: 'star', backColor: '#6b66ff'}"
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
export default class ViewHaveTags extends Vue {
  @State currentAppSection!: string

  @taskVuex.State tasks!: Task[]

  persName: string = 'Today'

  @Prop(Boolean) value!: string

  get isOnOverview(): boolean {
    return this.currentAppSection === 'overview'
  }
  get baseTasks() {
    return appUtils.filterTasksBySmartPerspective(this.persName, this.tasks)
  }
}

</script>
