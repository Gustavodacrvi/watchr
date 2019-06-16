<template>
  <span>
    app
  </span>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator'
import { Mutation, Getter } from 'vuex-class'


@Component
export default class Guest extends Vue {
  @Prop({required: true}) public readonly localStorage!: boolean
  @Getter('isDesktop') public readonly isDesktop!: boolean
  @Mutation('openAppBar') public readonly openAppBar!: () => void

  public created() {
    if (this.isDesktop) {
      this.openAppBar()
    }
  }
}

</script>

