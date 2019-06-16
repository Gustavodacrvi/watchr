<template>
  <div>
    {{ $store.state.appBarState }}
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { Mutation, Getter } from 'vuex-class'

@Component
export default class Guest extends Vue {
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Mutation('openAppBar') public readonly openAppBar!: () => void
  public created() {
    if (this.isDesktop) {
      this.openAppBar()
    }
  }
}

</script>
