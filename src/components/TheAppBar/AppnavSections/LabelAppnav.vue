<template>
  <div>
    <transition
      name='fade'
      mode='out-in'
    >
      <div v-if="selected.length === 0 || selectedType === 'smart'"
        class='header title'
        key='header-title'
      >
        <span class='title'>LABELS</span>
      </div>
      <div v-else
        class='header options'
        key='header-options'
      >
        <ft-icon
          class='header-icon icon txt pointer'
          icon='backspace'
          @click='deleteSelectedLabels'
        />
      </div>
    </transition>
    <renderer
      content-obj-property-name='name'
      sub-elements-property-name='subLabels'
      v-model='smart'
      :active-content='label'
      @input='saveSmart'
      @selected='selectSmart'
    ></renderer>
    <division
      name='CUSTOM LABELS'
      :options='divisionOptions'
    >
      <renderer v-if='nonSmartLabels'
        content-obj-property-name='name'
        sub-elements-property-name='subLabels'
        v-model='nonSmart'
        :active-content='label'
        :options='options'
        @input='saveNonSmart'
        @selected='selectNonSmart'
      ></renderer>
    </division>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, namespace } from 'vuex-class'

import Division from '@/components/TheAppBar/AppnavSections/AppnavComponents/AppnavDivision.vue'
import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavComponents/AppnavListrenderer.vue'

import appUtil from '@/utils/app'
import labelUtil from '@/utils/label'

import { Label, ListIcon, SimpleAdder, Alert } from '@/interfaces/app'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faBackspace, faSortAlphaDown } from '@fortawesome/free-solid-svg-icons'

library.add(faBackspace, faSortAlphaDown)

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
  @label.Getter getLabelNodeById!: (id: string | null) => Label | undefined
  @label.Action updateLabels!: (label: Label[]) => void
  @label.Action deleteLabelsById!: (ids: string[]) => void
  @label.Action addSubLabelById!: (obj: {parentId: string, subLabelName: string, position?: number}) => void
  @label.Action addRootLabel!: (obj: {labelName: string, position?: number}) => void
  @label.Action editLabelNameById!: (obj: {id: string, name: string}) => void
  @label.Action sortCustomLabelsByName!: () => void

  label: string = ''
  smart: Label[] = []
  nonSmart: Label[] = []
  selected: Label[] = []
  selectedType: 'smart' | 'nonSmart' = 'smart'
  divisionOptions: ListIcon[] = [
    {
      name: 'sort by name',
      iconColor: '',
      size: 'lg',
      icon: 'sort-alpha-down',
      callback: () => {
        this.sortCustomLabelsByName()
      },
    },
  ]

  created() {
    this.label = this.smartLabels[0].name
    this.smart = this.smartLabels
    this.nonSmart = this.nonSmartLabels
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
        name: 'edit label name',
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        callback: (lab: Label) => {
          this.pushPopUp('SimpleadderPopup')
          this.pushPopUpPayload({
            popUpTitle: 'Edit label name',
            buttonName: 'Edit label',
            inputPlaceholder: lab.name,
            inputMaximumCharacters: 50,
            callback: (input: string): void => {
              this.editLabelNameById({id: lab.id, name: input})
              this.pushPopUp('')
            },
          } as SimpleAdder)
        },
      },
      {
        name: 'delete label',
        icon: 'backspace',
        iconColor: '',
        size: 'lg',
        callback: (lab: Label) => {
          this.deleteLabelsById([lab.id])
          this.pushAlert({
            name: `Label <strong>${lab.name}</strong> was successfully deleted`,
            duration: 2.5,
            type: 'success',
          })
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
    const error = () => {
      this.pushAlert({
        name: `There is already another tag with the name ${name}`,
        duration: 2.5,
        type: 'error',
      })
    }
    if (lab.parentId === null) {
      const subLabel: Label | undefined = this.labels.find((el: Label) => el.name === name)
      if (subLabel)
        error()
      else {
        const index: number = this.labels.findIndex((el: Label) => el.id === lab.id)
        this.addRootLabel({
          labelName: name,
          position: index + increment,
        })
        this.pushAlert({
          name: `Label <strong>${name}</strong> was successfully added`,
          duration: 2.5,
          type: 'error',
        })
      }
    } else {
      const parent: Label = this.getLabelNodeById(lab.parentId) as Label
      const subLabel: Label | undefined = parent.subLabels.find((el: Label) => el.name === name)
      if (subLabel !== undefined)
        error()
      else {
        const index: number = parent.subLabels.findIndex((el: Label) => el.id === lab.id)
        this.addSubLabelById({
          parentId: parent.id,
          subLabelName: name,
          position: index + increment,
        })
        this.pushAlert({
          name: `Sublabel <strong>${name}</strong> was successfully added`,
          duration: 2.5,
          type: 'error',
        })
      }
    }
  }
  saveNonSmart() {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, this.nonSmart))
  }
  saveSmart() {
    this.updateLabels(appUtil.updateArrayOrderFromFilteredArray(this.labels, this.smart))
  }
  selectNonSmart(labels: Label[]) {
    this.selected = labels
    this.selectedType = 'nonSmart'
  }
  selectSmart(labels: Label[]) {
    this.selected = labels
    this.selectedType = 'smart'
  }
  deleteSelectedLabels() {
    this.deleteLabelsById(this.selected.map(el => el.id))
    this.pushAlert({
      name: `The selected labels were successfully deleted`,
      duration: 2.5,
      type: 'success',
    })
  }

  @Watch('labels')
  onLabelsChange() {
    this.smart = this.smartLabels
    this.nonSmart = this.nonSmartLabels
  }
}

</script>

<style scoped src='@/assets/css/appBarMenu.css'>
</style>
