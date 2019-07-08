<template>
  <span class='txt'>
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
    />
  </span>
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
  @Mutation pushAppView!: (compName: string) => void
  @Mutation pushPerspective!: (payload?: any) => void  

  @persVuex.Getter pinedSmartPerspectives!: SmartPerspective[]

  created() {
    if (!this.pinedSmartPerspectives[0].smartPerspective) {
      this.pushAppView('PerspectiveAppview')
      this.pushPerspective(this.pinedSmartPerspectives[0])
    }
  }
}

</script>

<style scoped>

</style>
