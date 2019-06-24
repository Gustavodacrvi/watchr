<template>
  <div>
    <renderer
      content-obj-property-name='name'
      sub-elements-property-name='subLabels'
      v-model='smartLabels'
      :active-content='label'
      @update='update'></renderer>
    <division name='CUSTOM LABELS'>
      <renderer v-if='nonSmartLabels'
        content-obj-property-name='name'
        sub-elements-property-name='subLabels'
        :list='nonSmartLabels'
        :active-el='label'
        :options='options'
        @update='update'></renderer>
    </division>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, Mutation, namespace } from 'vuex-class'

import Division from '@/components/TheAppBar/AppnavSections/AppnavDivision.vue'
import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'

import appUtil from '@/utils/app'
import labelUtil from '@/utils/label'

import { Label, ListIcon, SimpleAdder, Alert } from '@/interfaces/app'
import LabelAdder from '../../Alerts.vue'

const label = namespace('label')

@Component({
  components: {
    division: Division,
    renderer: ListRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State theme!: string
  @Mutation pushPopUp!: (compName: string) => void
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation pushPopUpPayload!: (payload: any) => void

  @label.State labels!: Label[]
  @label.Getter smartLabels!: Label[]
  @label.Getter nonSmartLabels!: Label[]
  @label.Getter labelPathById!: (id: string) => string[]
  @label.Getter getParentLabelById!: (id: string) => Label | undefined
  @label.Action updateLabels!: (label: Label[]) => void
  @label.Action deleteLabelById!: (id: string) => void
  @label.Action addSubLabelById!: (obj: {parentId: string, subLabelName: string, position?: number}) => void
  @label.Action addRootLabel!: (obj: {labelName: string, position?: number}) => void

  label: string = ''

  created() {
    this.label = this.smartLabels[0].name
  }

  options(): ListIcon[] {
    return [
      {
        name: 'add sublabel',
        icon: 'plus',
        iconColor: '',
        size: 'lg',
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
        size: 'lg',
        callback: (lab: Label) => {
          this.deleteLabelById(lab.id)
        },
      },
      {
        name: 'add label above',
        icon: 'arrow-up',
        iconColor: '',
        size: 'lg',
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
        size: 'lg',
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
  addLabel(position: 'below' | 'above', lab: Label, name: string) {
    this.pushPopUp('')
    let increment: 1 | 0 = 0
    if (position === 'below')
      increment = 1
    const parent: Label | undefined = this.getParentLabelById(lab.id)
    if (parent === undefined) {
      const subLabel: Label | undefined = this.labels.find((el: Label) => el.name === name)
      if (subLabel)
        this.pushAlert({
          name: `There is already another tag with the name <strong>${name}</strong>`,
          duration: 2.5,
          type: 'error',
        })
      else {
        const index: number = this.labels.findIndex((el: Label) => el.id === lab.id)
        this.addRootLabel({
          labelName: name,
          position: index + increment,
        })
      }
    } else {
      const subLabel: Label | undefined = parent.subLabels.find((el: Label) => el.name === name)
      if (subLabel !== undefined)
        this.pushAlert({
          name: `There is already another tag with the name ${name}`,
          duration: 2.5,
          type: 'error',
        })
      else {
        const index: number = parent.subLabels.findIndex((el: Label) => el.id === lab.id)
        this.addSubLabelById({
          parentId: parent.id,
          subLabelName: name,
          position: index + increment,
        })
      }
    }
  }
  update({arr}: {arr: Label[]}) {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, arr))
  }
}

</script>
