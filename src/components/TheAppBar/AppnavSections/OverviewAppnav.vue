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
import { State, Mutation, namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, SmartPerspective } from '@/interfaces/app'

const persVuex = namespace('perspective')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class OverviewAppnav extends Vue {
  @State appViewComponent!: string
  @State perspectiveData!: SmartPerspective
  @Mutation pushAppView!: (compName: string) => void
  @Mutation pushPerspective!: (payload?: any) => void

  @persVuex.Getter pinedSmartPerspectives!: SmartPerspective[]

  created() {
    if (!this.pinedSmartPerspectives[0].smartPerspective) {
      this.pushAppView('PerspectiveAppview')
      this.pushPerspective(this.pinedSmartPerspectives[0])
    }
  }

  get active(): string {
    if (this.perspectiveData && this.perspectiveData.smartPerspective)
      return this.perspectiveData.name
    return ''
  }
}

</script>

<style scoped>

</style>
