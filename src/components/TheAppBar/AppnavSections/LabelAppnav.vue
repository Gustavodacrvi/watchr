<template>
  <div>
    <div class='header title'>
      <span class='title'>LABELS</span>
    </div>
    <list-renderer
      group='labelAppnav'
      object-title-property-name='name'
      object-sublist-property-name='subLabels'
      :list='list'
      :get-sublist='getSubLabels'

      @update='onUpdate'
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
  @label.Getter rootLabels!: Label[]
  @label.Getter getSubLabelsFromIds!: (ids: string[]) => Label[]
  @label.Action moveLabelBetweenLists!: (obj: {movements: {newList: List, oldList: List}[], ids: string[]}) => void
  @label.Action saveLabelPosition!: (ids: string[]) => void

  list: Label[] = []

  created() {
    this.list = this.rootLabels
  }

  getSubLabels(ids: string[]): Label[] {
    return this.getSubLabelsFromIds(ids)
  }

  onUpdate(ids: string[]) {
    console.log('onUpdate')
    // this.saveLabelPosition(ids)
  }

  @Watch('labels')
  onStateChange() {
    this.list = this.rootLabels
  }
}

</script>

<style scoped src='@/assets/css/appnavSections.css'>
</style>
