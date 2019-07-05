<template>
  <div>
    <div class='header title'>
      <span class='title'>LABELS</span>
    </div>
    <list-renderer
      group='label appnav'
      object-title-property-name='name'
      object-sublist-property-name='subLabels'
      :list='list'
      :get-sublist='getSubLabels'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import { Label, List } from '../../../interfaces/app'

const label = namespace('label')
const list = namespace('list')

@Component({
  components: {
    'list-renderer': ListRenderer,
  },
})
export default class LabelAppnav extends Vue {
  @label.State labels!: Label[]
  @label.State update!: boolean
  @label.Getter rootLabels!: Label[]
  @label.Getter getSubLabelsFromIds!: (ids: string[]) => Label[]
  @label.Action moveLabelBetweenLists!: (arr: {newList: List, oldList: List}[]) => void
  @list.State transactionBetweenList!: boolean
  @list.State transactionListName!: string
  @list.State movements!: {newList: List, oldList: List}[]

  list: Label[] = []

  created() {
    this.list = this.rootLabels
  }

  getSubLabels(ids: string[]): Label[] {
    return this.getSubLabelsFromIds(ids)
  }

  @Watch('transactionBetweenList')
  onTrans() {
    if (this.transactionListName === 'label appnav')
      this.moveLabelBetweenLists(this.movements)
  }
  @Watch('update')
  onChange() {
    this.list = []
    this.$nextTick(() => {
      this.list = this.rootLabels
    })
  }
  @Watch('labels')
  onStateChange() {
    this.list = this.rootLabels
  }
}

</script>

<style scoped src='@/assets/css/appnavSections.css'>
</style>
