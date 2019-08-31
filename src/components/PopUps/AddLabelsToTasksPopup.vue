<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>asdfasdf asdf asdf asdfasdf</h2>
    </div>
    <div class='content'>
      {{popUpPayload}}
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import { SimpleAdder } from '@/interfaces/app'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'
import { IndexState } from '../../interfaces/store/index'

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: IndexState.theme
  @State popUpPayload!: IndexState.popUpPayload

}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
