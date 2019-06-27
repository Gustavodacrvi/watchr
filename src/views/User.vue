<template>
  <div v-if='loggedAndVerified'>
    
  </div>
  <div v-else-if='loggedAndNotVerified'>
  </div>
  <div v-else>
    sadf
  </div>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Mutation, Getter, State } from 'vuex-class'

@Component
export default class Guest extends Vue {
  @State currentUser!: firebase.User
  @Mutation openAppBar!: () => void
  @Getter isDesktop!: boolean
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean

  created() {
    this.open()
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
  }

  @Watch('isDesktop')
  onResize() {
    this.open()
  }
  @Watch('currentUser')
  onUserChange() {
    this.open()
  }
}

</script>
