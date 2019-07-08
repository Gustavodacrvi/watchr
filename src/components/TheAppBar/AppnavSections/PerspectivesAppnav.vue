<template>
  <div>
    <appnav-header
      name='PERSPECTIVES'
      :show-title='selected.length === 0'
      :icons='headerIcons'
      :selected='selected'
    />
    <list-renderer
      group='appnavPerspectives'
      :list='sortedSmartPerspectives'
      :options='getOptions'
      :help-icons='helpIcons'
      :active='active'
      @update='onUpdate'
      @selected='v => selected = v'
    />
  </div>
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
  @State perspectiveData!: SmartPerspective

  @persVuex.State smartOrder!: SmartPerspective[]
  @persVuex.Getter sortedSmartPerspectives!: SmartPerspective[]
  @persVuex.Action saveSmartOrder!: (ids: string[]) => void
  @persVuex.Action togglePerspectivesPin!: (obj: Array<{id: string, pin?: boolean}>) => void

  selected: SmartPerspective[] = []
  headerIcons: ListIcon[] = [
    {
      name: '',
      icon: 'thumbtack',
      iconColor: '',
      size: 'lg',
      callback: (selected: string[]) => {
        const arr: any = []
        for (const el of selected)
          arr.push({id: el})
        this.togglePerspectivesPin(arr)
      },
    },
  ]

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
          this.togglePerspectivesPin([{id}])
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

  get active(): string {
    if (this.perspectiveData.smartPerspective)
      return this.perspectiveData.name
    return ''
  }
}

</script>

<style scoped>

</style>
