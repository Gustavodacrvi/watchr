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
import { Getter, State, Mutation, namespace } from 'vuex-class'

import Draggable from 'vuedraggable'
import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import Division from '@/components/TheAppBar/AppnavSections/AppnavDivision.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

import appUtil from '@/utils/app'
import labelUtil from '@/utils/label'

import { Label, ListIcon, SimpleAdder } from '@/interfaces/app'

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
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Mutation('pushPopUpPayload') public readonly pushPopUpPayload!: (payload: any) => void
  @label.State('labels') public readonly labels!: Label[]
  @label.Getter('smartLabels') public readonly smartLabels!: Label[]
  @label.Getter('nonSmartLabels') public readonly nonSmartLabels!: Label[]
  @label.Getter('labelPathById') public readonly labelPathById!: (id: string) => string[]
  @label.Action('updateLabels') public readonly updateLabels!: (label: Label[]) => void
  @label.Action('getParentLabelById') public readonly getParentLabelById!: (id: string) => Label | undefined
  @label.Action('deleteLabelById') public readonly deleteLabelById!: (id: string) => void
  @label.Action('addSubLabelById') public readonly addSubLabelById!: (obj: {parentId: string, subLabelName: string}) => void

  public label: string = ''

  public created() {
    this.label = this.smartLabels[0].name
  }

  public options(): ListIcon[] {
    return [
      {
        name: 'add sublabel',
        icon: 'plus',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          const path: string[] = this.labelPathById(lab.id)
          const strPath: string = labelUtil.getStringPathFromArr(path)
          this.pushPopUp('LabeladderPopup')
          this.pushPopUpPayload(strPath + ':')
        },
      },
      {
        name: 'delete label',
        icon: 'backspace',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          this.deleteLabelById(lab.id)
        },
      },
      {
        name: 'add label above',
        icon: 'arrow-up',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          this.pushPopUp('SimpleadderPopup')
          this.pushPopUpPayload({
            popUpTitle: 'Add label',
            buttonName: 'Add label',
            inputPlaceholder: 'Label name: ',
            inputMaximumCharacters: 50,
            callback: (input: string): void => {
              const parent: Label | undefined = this.getParentLabelById(lab.id)
              if (!parent) {
                const index: number = this.labels.findIndex((el: Label) => el.id === lab.id)
                
              } 
            }
          } as SimpleAdder)
        },
      },
      {
        name: 'add label below',
        icon: 'arrow-down',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {

        },
      },
    ]
  }

  public update({arr}: {arr: Label[]}): void {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, arr))
  }
}

</script>
