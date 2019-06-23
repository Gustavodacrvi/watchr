<template>
  <span>
    
  </span>
</template>

<script lang="ts">

import { Component, Vue, Prop } from 'vue-property-decorator'
import { Mutation, Getter } from 'vuex-class'

@Component
export default class Guest extends Vue {
  @Mutation openAppBar!: () => void
  @Getter isDesktop!: boolean

  public created() {
    if (!localStorage.getItem('watchrFirstTimeIn')) {
      this.$store.dispatch('perspective/setDefaultData')
      this.$store.dispatch('label/setDefaultData')

      localStorage.setItem('watchrFirstTimeIn', 'true')
    } else {
      this.$store.commit('perspective/getSavedData')
      this.$store.commit('label/getSavedData')
    }
    if (this.isDesktop)
      this.openAppBar()
  }
}

</script>
