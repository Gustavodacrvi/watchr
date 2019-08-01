<template>
  <div>
    <appnav-header
      name='LABELS'
      :show-title='selected.length === 0'
      :icons='headerIcons'
    />
    <list-renderer v-if='sortedLabels && sortedLabels.length > 0'
      group='appnavlabels'
      route='label'
      :list='getLabels'
      :options='getOptions'
      :active='activePers'
      @update='onUpdate'
      @selected='v => selected = v'
    />
    <appnav-message v-else @click="pushPopUp('LabeladderPopup')" name='Add label'/>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { namespace, Mutation, State, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'
import AppnavMessage from '@/components/TheAppBar/AppnavComponents/AppnavAddmessage.vue'

import { Label, ListIcon, SimpleAdder, Perspective, ListElement, Alert } from '../../../interfaces/app'

const label = namespace('label')
const task = namespace('task')
const pers = namespace('perspective')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
    'appnav-message': AppnavMessage,
  },
})
export default class LabelAppnav extends Vue {
  @State viewName!: string
  @State viewType!: string
  @Mutation pushPopUpPayload!: (obj: SimpleAdder) => void
  @Mutation pushPopUp!: (comp: string) => void
  @Mutation pushAlert!: (alert: Alert) => void
  @Mutation openSection!: (section: string) => void

  @label.Getter sortedLabels!: Label[]
  @label.Getter getLabelsByIds!: (ids: string[]) => Label[]
  @label.Action saveLabelPosition!: (ids: string[]) => void
  @label.Action deleteLabelsById!: (ids: string[]) => void
  @label.Action editLabelNameById!: (obj: {id: string, name: string}) => void

  @task.Getter getNumberOfTasksByLabel!: (labelId: string) => number

  @pers.Getter initialPerspective!: string

  @Prop(String) search!: string

  selected: string[] = []

  created() {
    this.openSection('labels')
  }

  getOptions(obj: Label[]): ListIcon[] {
    return [
      {
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        name: 'Delete label',
        callback: (id: string) => {
          this.activeLabel(this.getLabelsByIds([id])[0].name)
          this.deleteLabelsById([id])
        },
      },
      {
        icon: 'edit',
        iconColor: '',
        size: 'lg',
        name: 'Edit label',
        callback: (id: string) => {
          this.pushPopUp('SimpleadderPopup')
          this.pushPopUpPayload({
            popUpTitle: 'Edit label name',
            inputMaximumCharacters: 40,
            buttonName: 'Save new label name',
            inputPlaceholder: this.getLabelsByIds([id])[0].name,
            callback: name => {
              this.pushPopUp('')
              this.pushAlert({
                name: `<strong>${name}</strong> label was successfully saved.`,
                duration: 2.5,
                type: 'success',
              })
              this.editLabelNameById({
                id,
                name,
              })
              this.$router.push('user?label=' + name)
            },
          })
        },
      },
    ]
  }
  activeLabel(name: string) {
    if (name === this.activePers)
        this.$router.push('/user?pers=' + this.initialPerspective)
  }

  get activePers(): string {
    if (this.viewType === 'label')
      return this.viewName
    return ''
  }
  get headerIcons(): ListIcon[] {
    return [
      {
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        name: 'Delete label',
        callback: () => {
          for (const id of this.selected)
            this.activeLabel(this.getLabelsByIds([id])[0].name)
          this.deleteLabelsById(this.selected)
        },
      },
    ]
  }
  get getLabels(): ListElement[] {
    const els: ListElement[] = []
    const pers = this.sortedLabels.filter(el => el.name.includes(this.search))
    for (const lab of pers) {
      const num = this.getNumberOfTasksByLabel(lab.id)
      els.push({
        ...lab, show: true, number: num,
      })
    }
    return els
  }

  onUpdate(ids: string[]) {
    this.saveLabelPosition(ids)
  }
}

</script>

