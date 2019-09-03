<template>
  <div class="confirm">
    <div class="center">
      <h2>Are You Sure?</h2>
    </div>
    <p class="msg txt dark" v-if='card.payload' v-html="card.payload">
    </p>
    <div class="btns">
      <div class="btn">
        <form-btn @click='handle(true)' class='big alert'>Yes</form-btn>
      </div>
      <div class="btn">
        <form-btn @click='handle(false)' class='transparent big alert'>Cancel</form-btn>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import { IndexState, IndexMutations } from '../../interfaces/store/index'

import FormButton from '@/components/PopUps/FormComponents/FormButton.vue'

@Component({
  components: {
    'form-btn': FormButton,
  },
})
export default class ConfirmCenteredCard extends Vue {
  @State('centeredCard') card!: IndexState.centeredCard
  @Mutation pushCenteredCard!: IndexMutations.PushCenteredCard

  handle(confirm: boolean) {
    if (this.card) {
      this.card.listIconHandler(confirm)
      this.pushCenteredCard(null)
    }
  }
}

</script>

<style scoped>

.confirm {
  padding: 12px;
}

.center {
  text-align: center;
}

.btns {
  display: flex;
}

.btn {
  padding: 4px;
  flex-basis: 100%;
}

</style>
