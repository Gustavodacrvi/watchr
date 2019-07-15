<template>
  <div>
    <appnav-header
      name='PERSPECTIVES'
      :show-title='selected.length === 0'
      :icons='headerIcons'
      :selected='selected'
    />
    <appnav-division name='SMART PERSPECTIVES'>
      <list-renderer
        group='appnavperspectives'
        route='pers'
        :list='sortedSmartPerspectives'
        :options='getOptions'
        :help-icons='helpIcons'
        :active='activePers'
        @update='onUpdate'
        @selected='v => selected = v'
      />
    </appnav-division>
    <appnav-division name='CUSTOM PERSPECTIVE'>
      <list-renderer v-if='sortedCustomPerspectives && sortedCustomPerspectives.length > 0'
        group='appnavcustomperspectives'
        route='pers'
        :list='sortedCustomPerspectives'
        :active='activePers'
        @update='onCustomUpdate'
        @selected='v => selected = v'
      />
      <appnav-message v-else @click="pushPopUp('PerspectiveAdderPopup')" name='Add custom perspective'/>
    </appnav-division>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, namespace, Getter, Mutation } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'

import { Label, Perspective, ListIcon } from '@/interfaces/app'

const persVuex = namespace('perspective')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
    'appnav-division': AppnavDivision,
    'appnav-message': AppnavMessage,
  },
})
export default class OverviewAppnav extends Vue {
  @State viewName!: string
  @State viewType!: string
  @Mutation pushPopUp!: (comp: string) => void

  @persVuex.State smartOrder!: Perspective[]
  @persVuex.Getter sortedSmartPerspectives!: Perspective[]
  @persVuex.Getter sortedCustomPerspectives!: Perspective[]
  @persVuex.Action saveSmartOrder!: (ids: string[]) => void
  @persVuex.Action togglePerspectivesPin!: (obj: Array<{id: string, pin?: boolean}>) => void

  selected: Perspective[] = []
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

  get activePers(): string {
    if (this.viewType === 'perspective')
      return this.viewName
    return ''
  }

  onUpdate(ids: string[]) {
    this.saveSmartOrder(ids)
  }
  onCustomUpdate(ids: string[]) {

  }
  getOptions(per: Perspective) {
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
  helpIcons(per: Perspective) {
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
