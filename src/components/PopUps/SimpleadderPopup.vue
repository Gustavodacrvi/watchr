<template>
  <div class='simple-adder-popup' :class='theme'>
    <div class='title'>
      <h2>{{ popUpPayload.popUpTitle }}</h2>
    </div>
    <div class='content'>
      <form-input
        tabindex='1'
        v-model='input'
        :max='100'
        class='simpleadder'
        @state='e => inputState = e'
      />
      <button
        tabindex='2'
        class='margin button round-border'
        @click='runCallback'
      >{{ popUpPayload.buttonName }}</button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import { SimpleAdder } from '@/interfaces/app'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class SigninPopUp extends Vue {
  @State theme!: SimpleAdder
  @State popUpPayload!: SimpleAdder

  input: string | null = null
  inputState: boolean = false

  mounted() {
    const el = document.querySelectorAll('.simpleadder')[0] as any
    el.focus()
    setTimeout(() => {
      this.input = this.popUpPayload.inputPlaceholder
    }, 100)
  }

  runCallback() {
    if (this.inputState && this.input !== null)
      this.popUpPayload.callback(this.input)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
