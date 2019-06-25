<template>
  <div>
    <renderer
      content-obj-property-name='name'
      v-model='smartBindedPerspectives'
      :active-content='perspective'
      :disabled='true'
    ></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Watch } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import { Perspective } from '@/interfaces/app'

import ListRenderer from '@/components/TheAppBar/AppnavSections/AppnavListrenderer.vue'

const perspective = namespace('perspective')

@Component({
  components: {
    renderer: ListRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State theme!: string
  @perspective.State perspectives!: Perspective[]
  @perspective.Getter smartBindedPerspectives!: Perspective[]

  arr: Perspective[] = this.smartBindedPerspectives
  perspective: string = 'Today'

  created() {
    this.arr = this.smartBindedPerspectives.slice()
  }

  @Watch('perspectives')
  onPerspectiveChange() {
    this.arr = this.perspectives
  }
}

</script>
