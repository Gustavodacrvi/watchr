<template>
  <div class='card round-border signin-popup' :class='theme'>
    <icon class='close' icon='times' hover-color='red' @click="pushPopUp('')"></icon>
    <div class='title'>
      <h2>Sign in</h2>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class SigninPopUp extends Vue {
  @State('theme') public theme!: string
  @Mutation('pushPopUp') public pushPopUp!: (compName: string) => void

}

</script>

<style scoped>

.signin-popup {
  position: relative;
  flex-basis: 600px;
}

.close {
  position: absolute;
  right: 8px;
  top: 8px;
}

.title {
  text-align: center;
}

</style>
