<template>
  <div>
    <renderer :list='smartBindedPerspectives' content='name' :active='perspective' :sort='false'></renderer>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Getter, State, namespace } from 'vuex-class'

import { Perspective } from '@/interfaces/app'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'
import LinkRenderer from '@/components/TheAppBar/AppnavSections/AppnavLinkrenderer.vue'

const perspective = namespace('perspective')

@Component({
  components: {
    icon: FontAwesomeIcon,
    renderer: LinkRenderer,
  },
})
export default class OverviewAppnav extends Vue {
  @State('theme') public readonly theme!: string
  @perspective.Getter('smartBindedPerspectives') public readonly smartBindedPerspectives!: Perspective[]

  public perspective: string = 'Today'
}

</script>
