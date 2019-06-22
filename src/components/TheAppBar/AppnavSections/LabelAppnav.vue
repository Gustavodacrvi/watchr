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

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import Division from '@/components/TheAppBar/AppnavSections/AppnavDivision.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

import appUtil from '@/utils/app'
import labelUtil from '@/utils/label'

import { Label, ListIcon, SimpleAdder } from '@/interfaces/app'
import { Alert } from '@/interfaces/alert'
import LabelAdder from '../../Alerts.vue'

const label = namespace('label')

@Component({
  components: {
    icon: FontAwesomeIcon,
    division: Division,
    renderer: LinkRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void
  @Mutation('pushAlert') public readonly pushAlert!: (alert: Alert) => void
  @Mutation('pushPopUpPayload') public readonly pushPopUpPayload!: (payload: any) => void
  @label.State('labels') public readonly labels!: Label[]
  @label.Getter('smartLabels') public readonly smartLabels!: Label[]
  @label.Getter('nonSmartLabels') public readonly nonSmartLabels!: Label[]
  @label.Getter('labelPathById') public readonly labelPathById!: (id: string) => string[]
  @label.Getter('getParentLabelById') public readonly getParentLabelById!: (id: string) => Label | undefined
  @label.Action('updateLabels') public readonly updateLabels!: (label: Label[]) => void
  @label.Action('deleteLabelById') public readonly deleteLabelById!: (id: string) => void
  // tslint:disable-next-line:max-line-length
  @label.Action('addSubLabelById') public readonly addSubLabelById!: (obj: {parentId: string, subLabelName: string, position?: number}) => void
  @label.Action('addRootLabel') public readonly addRootLabel!: (obj: {labelName: string, position?: number}) => void

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
              this.addLabel('above', lab, input)
            },
          } as SimpleAdder)
        },
      },
      {
        name: 'add label below',
        icon: 'arrow-down',
        iconColor: '',
        size: '',
        callback: (lab: Label) => {
          this.pushPopUp('SimpleadderPopup')
          this.pushPopUpPayload({
            popUpTitle: 'Add label',
            buttonName: 'Add label',
            inputPlaceholder: 'Label name: ',
            inputMaximumCharacters: 50,
            callback: (input: string) => {
              this.addLabel('below', lab, input)
            },
          } as SimpleAdder)
        },
      },
    ]
  }
  public addLabel(position: 'below' | 'above', lab: Label, name: string): void {
    this.pushPopUp('')
    let increment: 1 | 0 = 0
    if (position === 'below') {
      increment = 1
    }
    const parent: Label | undefined = this.getParentLabelById(lab.id)
    if (parent === undefined) {
      const subLabel: Label | undefined = this.labels.find((el: Label) => el.name === name)
      if (subLabel) {
        this.pushAlert({
          name: `There is already another tag with the name <strong>${name}</strong>`,
          duration: 2.5,
          type: 'error',
        })
      } else {
        const index: number = this.labels.findIndex((el: Label) => el.id === lab.id)
        this.addRootLabel({
          labelName: name,
          position: index + increment,
        })
      }
    } else {
      const subLabel: Label | undefined = parent.subLabels.find((el: Label) => el.name === name)
      if (subLabel !== undefined) {
        this.pushAlert({
          name: `There is already another tag with the name ${name}`,
          duration: 2.5,
          type: 'error',
        })
      } else {
        const index: number = parent.subLabels.findIndex((el: Label) => el.id === lab.id)
        this.addSubLabelById({
          parentId: parent.id,
          subLabelName: name,
          position: index + increment,
        })
      }
    }
  }

  public update({arr}: {arr: Label[]}): void {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, arr))
  }
}

</script>
