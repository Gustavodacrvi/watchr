<template>
  <span class='txt'>
    <appnav-header
      name='PERSPECTIVES'
      :show-title='true'
      :icons='[]'
      :selected='[]'
    />
    <list-renderer
      group='appnavPerspectives'
      :list='sortedSmartPerspectives'
      :options='getOptions'
      :help-icons='helpIcons'
      @update='onUpdate'
    />
  </span>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, SmartPerspective, ListIcon } from '@/interfaces/app'

const persVuex = namespace('perspective')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class OverviewAppnav extends Vue {
  @persVuex.State smartOrder!: SmartPerspective[]
  @persVuex.Getter sortedSmartPerspectives!: SmartPerspective[]
  @persVuex.Action saveSmartOrder!: (ids: string[]) => void
  @persVuex.Action togglePerspectivePin!: (obj: {id: string, pin?: boolean}) => void

  onUpdate(ids: string[]) {
    this.saveSmartOrder(ids)
  }

  getOptions(per: SmartPerspective) {
    const icons: ListIcon[] = [
      {
        name: 'pin perspective',
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (id: string) => {
          this.togglePerspectivePin({id})
        },
      },
    ]
    if (per.pin)
      icons[0].name = 'unpin perspective'
    return icons
  }
  helpIcons(per: SmartPerspective) {
    const icons: ListIcon[] = []
    if (per.pin)
      icons.push({
        icon: 'thumbtack',
        iconColor: '',
        name: '',
        size: 'xs',
      })
    return icons
  }
}

</script>

<style scoped>

</style>
