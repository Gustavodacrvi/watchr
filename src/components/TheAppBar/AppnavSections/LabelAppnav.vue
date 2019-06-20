<template>
  <div>
    <draggable v-if='smarts' v-model='smarts' :animation='300' @end='onEnd'>
      <span class='label round-border list-el' v-for='lab in smarts' :class='[theme, {active: lab.name === label}]' :key='lab.id'>
        <span class='txt name'>{{ lab.name }}</span>
      </span>
    </draggable>
    <division name='CUSTOM LABELS'>
      <span class='list-el round-border txt' :class='theme'>
        <renderer></renderer>
      </span>
    </division>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import Division from '@/components/TheAppBar/AppnavSections/AppnavDivision.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

import appUtil from '@/utils/app'

import { Label } from '@/interfaces/app'

const label = namespace('label')

@Component({
  components: {
    draggable: Draggable,
    icon: FontAwesomeIcon,
    division: Division,
    renderer: LinkRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @label.Getter('smartLabels') public readonly smartLabels!: Label[]
  @label.Action('updateLabels') public readonly updateLabels!: (label: Label[]) => void

  public smarts: Label[] = []
  public label: string = ''

  public created() {
    this.smarts = this.smartLabels
    this.label = this.smarts[0].name
  }
  public onEnd() {
    const arr: Label[] = appUtil.updateArrayOrderFromFilteredArray(this.smartLabels, this.smarts)
    this.updateLabels(arr)
  }
}

</script>

<style scoped src='@/assets/css/appBarSection.css'>
</style>
