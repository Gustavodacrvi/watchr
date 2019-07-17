<template>
  <div>
    <appnav-header
      name='OVERVIEW'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <list-renderer
      group='appnavoverview'
      route='pers'
      :disabled='true'
      :list='pinedSmartPerspectives'
      :active='activePers'
    />
    <div class='margin'></div>
    <list-renderer
      group='appnavoverviewcustompers'
      route='pers'
      :disabled='true'
      :list='pinedCustomPerspectives'
      :active='activePers'
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
  @State viewType!: string
  @Mutation openSection!: (section: string) => void

  @persVuex.Getter pinedSmartPerspectives!: Perspective[]
  @persVuex.Getter pinedCustomPerspectives!: Perspective[]

  created() {
    this.openSection('overview')
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
