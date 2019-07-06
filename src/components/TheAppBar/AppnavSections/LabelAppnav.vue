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
      @push='onPush'
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
  @label.Action moveLabelBetweenLists!: (obj: {movements: {newList: List, oldList: List}[], ids: string[]}) => void
  @label.Action saveLabelPosition!: (ids: string[]) => void

  list: Label[] = []

  created() {
    this.list = this.rootLabels
  }
  errorCaptured() {
    console.log('appnav')
  }

  getSubLabels(ids: string[]): Label[] {
    return this.getSubLabelsFromIds(ids)
  }

  onUpdate(ids: string[]) {
    this.saveLabelPosition(ids)
  }
  onPush(obj: any) {
    this.moveLabelBetweenLists(obj)
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
