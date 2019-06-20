<template>
  <div>
    <renderer :list='smarts' content='name' active='perspective'></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

import appUtil from '@/utils/app'

import { Perspective } from '@/interfaces/app'

const perspective = namespace('perspective')

@Component({
  components: {
    renderer: LinkRenderer,
    icon: FontAwesomeIcon,
  },
})
export default class PerspectiveAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @perspective.Getter('smartBindedPerspectives') public readonly smartBindedPerspectives!: Perspective[]
  @perspective.Action('updatePerspectives') public readonly updatePerspectives!: (perspectives: Perspective[]) => void

  public smarts: Perspective[] = []
  public perspective: string = 'Today'

  public created() {
    this.smarts = this.smartBindedPerspectives
  }

  public onEnd(e: any): void {
    const arr: Perspective[] = appUtil.updateArrayOrderFromFilteredArray(this.smartBindedPerspectives, this.smarts)
    this.updatePerspectives(arr)
  }
}

</script>
