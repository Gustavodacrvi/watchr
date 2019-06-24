<template>
  <div>
    <transition name='fade' mode='out-in'>
      <div v-if='selected.length === 0' class='header title' key='header-title'>
        <span class='title'>PERSPECTIVES</span>
      </div>
      <div v-else class='header options' key='header-options'>
      </div>
    </transition>
    <renderer :list='smartPerspectives' content-obj-property-name='name' active-content='perspective' @update='update' :right-pan-gesture='rightPanEvent'
     @panevent='pan' :icons='icons' :options='options' @selected="select"></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'

import appUtil from '@/utils/app'

import { Perspective, PanGesture, ListIcon } from '@/interfaces/app'

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
