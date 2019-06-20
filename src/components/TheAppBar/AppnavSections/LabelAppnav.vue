<template>
  <div>
    <draggable v-if='smarts' v-model='smarts' :animation='300' @end='onEnd'>
      <div class='list-el' v-for='lab in smarts' :key='lab.id'>
        <div class='round-border visible' :class='[theme, {active: lab.name === label}]'>
          <div class='content'>
            <span class='txt name'>{{ lab.name }}</span>
          </div>
        </div>
      </div>
    </draggable>
    <division name='CUSTOM LABELS'>
      <span class='list-el round-border txt' :class='theme'>
        <renderer v-if='test' :list='test' content='name' active='evelyn' sublists='sublists'></renderer>
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
  @label.Getter('nonSmartLabels') public readonly nonSmartLabels!: Label[]
  @label.Action('updateLabels') public readonly updateLabels!: (label: Label[]) => void

  public smarts: Label[] = []
  public label: string = ''
  public test: any[] = [
    {
      name: 'yeh',
      id: 'a',
      sublists: [
        {
          name: 'evelyn',
          id: 'e',
          sublists: [],
        },
        {
          name: 'workplace',
          id: 'w',
          sublists: [
            {
              name: 'jennifer',
              id: 'je',
              sublists: [],
            },
            {
              name: 'anotherone',
              id: 'asdfasd',
              sublists: [],
            }
          ]
        },
        {
          name: 'kid',
          id: 'k',
          sublists: [],
        },
      ],
    },
    {
      name: 'bruh',
      id: 'b',
      sublists: [],
    }, {
      name: 'last one',
      id: 'las',
      sublists: [
        {
          name: 'somethin',
          id: 'd',
          sublists: [],
        },
        {
          name: 'mean',
          id: 'm',
          sublists: [],
        }
      ]
    }
  ]

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
