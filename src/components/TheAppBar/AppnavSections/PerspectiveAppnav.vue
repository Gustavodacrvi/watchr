<template>
  <div>
    <renderer :list='smartPerspectives' content='name' active='perspective' @update='update' :rightpan='rightPanEvent'
     @panevent='pan' :icons='icons' :mapicon='mapIcon' :options='options'></renderer>
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
  public icons: ListIcon[] = [
    {
      icon: 'thumbtack',
      iconColor: '',
      size: 'xs',
    },
  ]
  public mapIcon(icons: ListIcon[], pers: Perspective): ListIcon[] {
    if (pers.binded) {
      return icons
    }
    return []
  }
  public options: ListIcon[] = [
    {
      name: 'option 1',
      icon: 'list',
      iconColor: '',
      size: '',
      callback: () => console.log(1),
    },
    {
      name: 'option 2',
      icon: 'list',
      iconColor: '',
      size: '',
      callback: () => console.log(2),
    },
    {
      name: 'option 3',
      icon: 'list',
      iconColor: '',
      size: '',
      callback: () => console.log(3),
    },
    {
      name: 'option 4',
      icon: 'list',
      iconColor: '',
      size: '',
      callback: () => console.log(4),
    },
  ]

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
