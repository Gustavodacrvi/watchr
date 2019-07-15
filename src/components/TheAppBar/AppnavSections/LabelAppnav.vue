<template>
  <div>
    <appnav-header
      name='LABELS'
      :show-title='selected.length === 0'
      :icons='headerIcons'
      :selected='selected'
    />
    <list-renderer v-if='sortedLabels && sortedLabels.length > 0'
      group='appnavlabels'
      route='labels'
      :list='sortedLabels'
      :options='getOptions'
      :active='activePers'
      @update='onUpdate'
      @selected='v => selected = v'
    />
    <div v-else class='add-label-alert' @click="pushPopUp('LabeladderPopup')">
      <span class='txt pointer icon'>
        <i class='fas fa-plus fa-lg'></i>
        <span>Add label</span>
      </span>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace, Mutation, State, Getter } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import AppnavHeader from '@/components/TheAppBar/AppnavComponents/AppnavHeader.vue'

import { Label, ListIcon, SimpleAdder, Perspective } from '../../../interfaces/app'

const label = namespace('label')
const list = namespace('list')

@Component({
  components: {
    'list-renderer': ListRenderer,
    'appnav-header': AppnavHeader,
  },
})
export default class LabelAppnav extends Vue {
  @State viewName!: string
  @State viewType!: string
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

  get activePers(): string {
    if (this.viewType === 'perspective')
      return this.viewName
    return ''
  }

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

<style scoped>

.fas {
  margin-right: 20px;
}

.add-label-alert {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

</style>
