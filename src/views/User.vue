<template>
  <transition name='fade' mode='out-in'>
    <div key='loggedAndVerified' v-if='loggedAndVerified'>
      <span class='txt'>logged and verified</span>    
    </div>
    <div key='loggedAndNotVerified' v-else-if='loggedAndNotVerified'>
      <span class='txt'>logged and not verified</span>
    </div>
    <div key='else' v-else>
      <span class='txt'>not logged or anonymous</span>
    </div>
  </transition>
</template>

<script lang="ts">

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Mutation, Getter, State } from 'vuex-class'

@Component
export default class Guest extends Vue {
  @Getter loggedAndVerified!: boolean
  @Getter loggedAndNotVerified!: boolean
  @Getter anonymous!: boolean
  @Getter isDesktop!: boolean
  @Mutation openAppBar!: () => void
  @Mutation closeAppBar!: () => void

  created() {
    this.open()
  }

  open() {
    if (this.isDesktop && (this.loggedAndVerified || this.anonymous))
      this.openAppBar()
    else if (this.isDesktop)
      this.closeAppBar()
  }

  @Watch('isDesktop')
  onResize() {
    this.open()
  }
  @Watch('loggedAndVerified')
  onUserChange() {
    this.open()
  }
}

</script>
