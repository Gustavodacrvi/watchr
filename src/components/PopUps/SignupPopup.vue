<template>
  <div class='signin-popup' :class='theme'>
    <div class='title'>
      <h2>Sign up</h2>
    </div>
    <div class='content'>
      <input class='margin input txt round-border gray' placeholder='Username: ' type='text' autocomplete='off' :class='[theme, {wrong: inputHasError(username)}, platform]' v-model='username'>
      <input  class='margin input txt round-border gray' placeholder='E-mail: ' type='text' autocomplete='off' :class='[theme, , {wrong: inputHasError(email)}, platform]' v-model='email'>
      <div class='margin password' :class='platform'>
        <input class='input txt round-border gray' placeholder='New password: ' :type='passwordType' autocomplete='off' :class='[theme, , {wrong: inputHasError(password)}]' v-model='password'>
        <span class='eyes'>
          <transition name='fade'>
            <icon v-if="passwordType === 'text'" class='eye' icon='eye' size='1x' @click='togglePassword'></icon>
            <icon v-else class='eye' icon='eye-slash' size='1x' @click='togglePassword'></icon>
          </transition>
        </span>
      </div>
      <div class='margin password' :class='platform'>
        <input class='input txt round-border gray' placeholder='Confirm password: ' :type='passwordType' autocomplete='off' :class='[theme, , {wrong: inputHasError(newPassword)}]' v-model='newPassword'>
        <span class='eyes'>
          <transition name='fade'>
            <icon v-if="passwordType === 'text'" class='eye' icon='eye' size='1x' @click='togglePassword'></icon>
            <icon v-else class='eye' icon='eye-slash' size='1x' @click='togglePassword'></icon>
          </transition>
        </span>
      </div>
      <button v-if='!waitingResponse' class='margin button round-border' @click='sendRequest' :class='platform'>Sign in</button>
      <button v-else class='margin button round-border' :class='platform'>
        <icon class='icon' icon='sync' hoverColor='white' color='white' :spin='true'></icon>
      </button>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Mixins } from 'vue-property-decorator'
import { State, Mutation, Getter } from 'vuex-class'
import Mixin from '@/mixins/authPopUp'

import FontAwesomeIcon from '@/components/FontAwesomeIcon.vue'

@Component({
  components: {
    icon: FontAwesomeIcon,
  },
})
export default class SigninPopUp extends Mixins(Mixin) {
  @State('theme') public readonly theme!: string
  @Getter('platform') public readonly platform!: 'mobile' | 'desktop'
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void

  public username: string | null = null
  public email: string | null = null
  public password: string | null = null
  public newPassword: string | null = null
  public waitingResponse: boolean = false

  public sendRequest(): void {
    const hasError: boolean = this.inputHasError(this.username, 50) || this.inputHasError(this.email, 50) ||
    this.inputHasError(this.password, 50) || this.inputHasError(this.newPassword, 50)
    if (!hasError) {
      this.waitingResponse = true
      setTimeout(() => {
        this.waitingResponse = false
      }, 2000)
    }
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
