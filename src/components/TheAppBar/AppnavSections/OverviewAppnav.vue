<template>
  <div>
    <appnav-header
      name='OVERVIEW'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <list-renderer
      group='appnavOverview'
      :disabled='true'
      :list='pinedSmartPerspectives'
      :active='active'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation, namespace, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, Perspective } from '@/interfaces/app'

const persVuex = namespace('perspective')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: string
  @State viewSect!: string
  @persVuex.Getter pinedSmartPerspectives!: Perspective[]

  get active(): string {
    if (this.viewSect === 'overview')
      return this.viewName
    return ''
  }
}

</script>

<style scoped>

</style>
