<template>
  <div>
    <renderer :list='smartPerspectives' content='name' active='perspective' @update='update' :rightpan='rightPanEvent'
     @panevent='pan' :icons='icons' :options='options'></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

import appUtil from '@/utils/app'

import { Perspective, PanGesture, ListIcon } from '@/interfaces/app'

const perspective = namespace('perspective')

@Component({
  components: {
    renderer: LinkRenderer,
    icon: FontAwesomeIcon,
  },
})
export default class PerspectiveAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @perspective.State('perspectives') public readonly perspectives!: Perspective[]
  @perspective.Mutation('toggleBindPerspectiveById') public readonly toggleBindPerspectiveById!: (id: string) => void
  @perspective.Getter('smartPerspectives') public readonly smartPerspectives!: Perspective[]
  @perspective.Action('updatePerspectives') public readonly updatePerspectives!: (perspectives: Perspective[]) => void

  public perspective: string = 'Today'
  public rightPanEvent: PanGesture = {
    icon: 'thumbtack',
    iconColor: 'white',
    distance: 100,
  }
  public icons(pers: Perspective): ListIcon[] {
    if (pers.binded) {
      return [
        {
          icon: 'thumbtack',
          iconColor: '',
          size: 'xs',
        },
      ]
    }
    return []
  }
  public options(pers: Perspective): ListIcon[] {
    let name = 'unbind from overview'
    if (!pers.binded) {
      name = 'bind on overview'
    }
    return [
      {
        name,
        icon: 'thumbtack',
        iconColor: '',
        size: '',
        callback: (per: Perspective) => {
          this.toggleBindPerspectiveById(per.id)
        },
      },
    ] as ListIcon[]
  }

  public update({arr}: {arr: Perspective[]}): void {
    this.updatePerspectives(appUtil.updateArrayOrderFromFilteredArray(this.perspectives, arr))
  }
  public pan(obj: any): void {
    if (obj.type === 'right') {
      this.toggleBindPerspectiveById(obj.id)
    }
  }
}

</script>
