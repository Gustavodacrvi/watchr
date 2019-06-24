<template>
  <div>
    <transition
      name='fade'
      mode='out-in'
    >
      <div v-if='selected.length === 0'
        class='header title'
        key='header-title'
      >
        <span class='title'>PERSPECTIVES</span>
      </div>
      <div v-else
        class='header options'
        key='header-options'
      >
        <ft-icon class='header-icon icon txt pointer' icon='thumbtack' />
        <ft-icon-layers class='header-icon'>
          <ft-icon class='txt' icon='thumbtack' />
          <ft-icon icon='slash' transform='shrink-6' :style="{ color: 'white' }" />
        </ft-icon-layers>
      </div>
    </transition>
    <renderer
      content-obj-property-name='name'
      active-content='perspective'
      :list='smartPerspectives'
      :right-pan-gesture='rightPanEvent'
      :icons='icons'
      :options='options'
      @update='update'
      @panevent='pan'
      @selected="select"
    ></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'

import appUtil from '@/utils/app'

import { Perspective, PanGesture, ListIcon } from '@/interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbtack, faSlash } from '@fortawesome/free-solid-svg-icons'

library.add(faThumbtack, faSlash)

const perspective = namespace('perspective')

@Component({
  components: {
    renderer: ListRenderer,
  },
})
export default class PerspectiveAppnav extends Vue {
  @State theme!: string
  @perspective.State perspectives!: Perspective[]
  @perspective.Mutation toggleBindPerspectiveById!: (id: string) => void
  @perspective.Getter smartPerspectives!: Perspective[]
  @perspective.Action updatePerspectives!: (perspectives: Perspective[]) => void

  perspective: string = 'Today'
  selected: Perspective[] = []
  rightPanEvent: PanGesture = {
    icon: 'thumbtack',
    iconColor: 'white',
    distance: 100,
  }

  icons(pers: Perspective): ListIcon[] {
    if (pers.binded)
      return [
        {
          icon: 'thumbtack',
          iconColor: '',
          size: 'xs',
        },
      ]
    return []
  }
  options(pers: Perspective): ListIcon[] {
    let name = 'unbind from overview'
    if (!pers.binded)
      name = 'bind on overview'
    return [
      {
        name,
        icon: 'thumbtack',
        iconColor: '',
        size: 'lg',
        callback: (per: Perspective) => {
          this.toggleBindPerspectiveById(per.id)
        },
      },
    ] as ListIcon[]
  }
  select(pers: Perspective[]): void {
    this.selected = pers
  }
  update({arr}: {arr: Perspective[]}): void {
    this.updatePerspectives(appUtil.updateArrayOrderFromFilteredArray(this.perspectives, arr))
  }
  pan(obj: any): void {
    if (obj.type === 'right')
      this.toggleBindPerspectiveById(obj.id)
  }
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
