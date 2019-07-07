<template>
  <div>
    <appnav-header
      name='LABELS'
      :show-title='selected.length === 0'
      :icons='headerIcons'
      :selected='selected'
    />
    <list-renderer
      group='appnavLabels'
      :list='sortedLabels'
      :options='getOptions'
      @update='onUpdate'
      @selected='v => selected = v'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace, Mutation } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, ListIcon, SimpleAdder } from '../../../interfaces/app'

const label = namespace('label')
const list = namespace('list')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class LabelAppnav extends Vue {
  @Mutation pushPopUpPayload!: (obj: SimpleAdder) => void
  @Mutation pushPopUp!: (comp: string) => void

  @label.Getter sortedLabels!: Label[]
  @label.Action saveLabelPosition!: (ids: string[]) => void
  @label.Action deleteLabelsById!: (ids: string[]) => void
  @label.Action editLabelNameById!: (obj: {id: string, name: string}) => void

  selected: string[] = []
  headerIcons: ListIcon[] = [
    {
      icon: 'trash',
        iconColor: '',
        size: 'lg',
        name: 'Delete label',
        callback: (selected: string[]) => {
          this.deleteLabelsById(selected)
        },
    },
  ]

  getOptions(obj: Label[]): ListIcon[] {
    return [
      {
        icon: 'trash',
        iconColor: '',
        size: 'lg',
        name: 'Delete label',
        callback: (id: string) => {
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
            inputPlaceholder: 'Label name',
            callback: name => {
              this.pushPopUp('')
              this.editLabelNameById({
                id,
                name,
              })
            },
          })
        },
      },
    ]
  }

  onUpdate(ids: string[]) {
    this.saveLabelPosition(ids)
  }
}

</script>
