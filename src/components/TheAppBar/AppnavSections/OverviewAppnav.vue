<template>
  <div>
    <appnav-header
      name='OVERVIEW'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <div v-if='smartPers && smartPers.length > 0'>
      <list-renderer
        group='appnavoverview'
        route='pers'
        :disabled='true'
        :list='smartPers'
        :active='activePers'
      />
      <div class='margin'></div>
    </div>
    <list-renderer
      group='appnavoverviewcustompers'
      route='pers'
      :disabled='true'
      :list='customPers'
      :active='activePers'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, Perspective, Task, ListIcon, ListElement } from '@/interfaces/app'

const persVuex = namespace('perspective')
const taskVuex = namespace('task')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: string
  @State viewType!: string
  @Mutation openSection!: (section: string) => void

  @persVuex.Getter pinedSmartPerspectives!: Perspective[]
  @persVuex.Getter pinedCustomPerspectives!: Perspective[]
  @persVuex.Getter getNumberOfTasksByPerspectiveId!: (id: string, tasks: Task[]) => number

  @taskVuex.State tasks!: Task[]

  created() {
    this.openSection('overview')
  }

  get smartPers(): ListElement[] {
    const els: ListElement[] = []
    for (const per of this.pinedSmartPerspectives) {
      let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks)
      let show = true
      if (per.showWhenNotEmpty && numberOfTasks === 0)
        show = false
      if (!per.numberOfTasks)
        numberOfTasks = 0
      els.push({
        ...per, show, number: numberOfTasks,
      })
    }
    return els
  }
  get customPers(): ListElement[] {
    const els: ListElement[] = []
    for (const per of this.pinedCustomPerspectives) {
      let numberOfTasks = this.getNumberOfTasksByPerspectiveId(per.id, this.tasks)
      let show = true
      if (per.showWhenNotEmpty && numberOfTasks === 0)
        show = false
      if (!per.numberOfTasks)
        numberOfTasks = 0
      els.push({
        ...per, show, number: numberOfTasks,
      })
    }
    return els
  }
  get activePers(): string {
    if (this.viewType === 'perspective')
      return this.viewName
    return ''
  }
}

</script>

<style scoped>

.margin {
  height: 30px;
}

</style>
