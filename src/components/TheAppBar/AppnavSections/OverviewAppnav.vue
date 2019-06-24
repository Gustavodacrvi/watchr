<template>
  <div>
    <renderer
      content-obj-property-name='name'
      :list='smartBindedPerspectives'
      :active-content='perspective'
      :disabled='true'
    ></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
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
  @perspective.Getter smartBindedPerspectives!: Perspective[]

  perspective: string = 'Today'
}

</script>
