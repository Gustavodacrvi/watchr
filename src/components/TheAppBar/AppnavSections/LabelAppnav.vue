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
      @listtolist='listToList'
    />
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'
import { Label, List } from '../../../interfaces/app'

const label = namespace('label')

@Component({
  components: {
    'list-renderer': ListRenderer,
  },
})
export default class LabelAppnav extends Vue {
  @label.State update!: boolean
  @label.Getter rootLabels!: Label[]
  @label.Getter getSubLabelsFromIds!: (ids: string[]) => Label[]
  @label.Action moveLabelBetweenLists!: (obj: {newList: List, oldList: List}) => void

  list: Label[] = []

  created() {
    this.list = this.rootLabels
  }

  getSubLabels(ids: string[]): Label[] {
    return this.getSubLabelsFromIds(ids)
  }

  listToList(obj: {newList: List, oldList: List}) {
    this.moveLabelBetweenLists(obj)
  }

  @Watch('update')
  onChange() {
    this.list = []
    this.$nextTick(() => {
      this.list = this.rootLabels
    })
  }
}

</script>

<style scoped src='@/assets/css/appnavSections.css'>
</style>
