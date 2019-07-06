<template>
  <div>
    <div class='header title'>
      <span class='title'>LABELS</span>
    </div>
    <list-renderer
      group='appnavLabels'
      :list='sortedLabels'
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
  @label.Getter sortedLabels!: Label[]
  @label.Action saveLabelPosition!: (ids: string[]) => void

  onUpdate(ids: string[]) {
    this.saveLabelPosition(ids)
  }
}

</script>

<style scoped src='@/assets/css/appnavSections.css'>
</style>
