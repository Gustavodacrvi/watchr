<template>
  <div>
    <renderer :list='smartLabels' content='name' :active='label' sublist='subLabels' @update='update'></renderer>
    <division name='CUSTOM LABELS'>
      <renderer v-if='nonSmartLabels' :list='nonSmartLabels' content='name' :active='label' sublist='subLabels' :options='options' @update='update'></renderer>
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

import { Label, ListIcon } from '@/interfaces/app'

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
  @label.State('labels') public readonly labels!: Label[]
  @label.Getter('smartLabels') public readonly smartLabels!: Label[]
  @label.Getter('nonSmartLabels') public readonly nonSmartLabels!: Label[]
  @label.Action('updateLabels') public readonly updateLabels!: (label: Label[]) => void

  public label: string = ''

  public created() {
    this.label = this.smartLabels[0].name
  }

  public options(lab: Label): ListIcon[] {
    return [
      {
        name: 'add sublabel',
        icon: 'plus',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          console.log('add sublabel')
        },
      },
      {
        name: 'delete label',
        icon: 'backspace',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          console.log('delete label')
        },
      },
    ]
  }

  public update({arr}: {arr: Label[]}): void {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, arr))
  }
}

</script>
