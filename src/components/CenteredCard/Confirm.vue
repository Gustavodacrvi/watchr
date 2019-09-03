<template>
  <div>
    confirm
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import { IndexState, IndexMutations } from '../../interfaces/store/index'

@Component
export default class ConfirmCenteredCard extends Vue {
  @State('centeredCard') card!: IndexState.centeredCard
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  select(obj: any) {
    if (this.card) {
      this.card.listIconHandler(obj)
      this.pushCenteredCard(null)
    }
  }
}

</script>

