<template>
  <span>
    
  </span>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Mutation, Getter } from 'vuex-class'

@Component
export default class Guest extends Vue {
  @Mutation openAppBar!: () => void
  @Getter isDesktop!: boolean

  created() {
    if (this.isDesktop)
      this.openAppBar()
  }

  @Watch('isDesktop')
  onResize() {
    this.openAppBar()
  }
}

</script>
