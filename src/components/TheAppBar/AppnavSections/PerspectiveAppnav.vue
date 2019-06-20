<template>
  <div>
    <draggable v-if='smarts' v-model='smarts' :animation='300' @end='onEnd'>
      <span class='perspective round-border list-el' v-for='pers in smarts' :class='[theme, {active: pers.name === perspective}]' :key='pers.name'>
        <span class='icon'>
          <icon :icon='pers.icon' :color='pers.iconColor'></icon>
        </span>
        <span class='txt name'>{{ pers.name }}</span>
      </span>
    </draggable>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

import appUtil from '@/utils/app'

import { Perspective } from '@/interfaces/app'
import app from '@/utils/app'

const perspective = namespace('perspective')

@Component({
  components: {
    draggable: Draggable,
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

<style scoped src='@/assets/css/appBarSection.css'>
</style>
