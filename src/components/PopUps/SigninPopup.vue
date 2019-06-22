<template>
  <div class='signin-popup' :class='theme'>
    <div class='title'>
      <h2>Sign in</h2>
    </div>
    <div class='content'>
      <input class='margin input txt round-border gray' placeholder='Username: ' type='text' autocomplete='off' :class='[theme,{wrong: inputHasError(username, 50)}]' v-model='username'>
      <div class='margin password'>
        <input class='input txt round-border gray' placeholder='Password: ' :type='passwordType' autocomplete='off' :class='[theme, {wrong: inputHasError(password, 50)}]' v-model='password'>
        <span class='eyes'>
          <transition name='fade'>
            <icon v-if="passwordType === 'text'" class='eye' icon='eye' size='1x' @click='togglePassword'></icon>
            <icon v-else class='eye' icon='eye-slash' size='1x' @click='togglePassword'></icon>
          </transition>
        </span>
      </div>
        <button v-if='!waitingResponse' class='margin button round-border' @click='sendRequest'>Sign in</button>
        <button v-else class='margin button round-border'>
          <icon class='icon' icon='sync' hoverColor='white' color='white' :spin='true'></icon>
        </button>
      <div class='margin links'>
        <span class='link'>Forgot password?</span>
        <span class='link'>Forgot username?</span>
      </div>
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
  @Mutation('pushPopUp') public readonly pushPopUp!: (compName: string) => void

  public username: string | null = null
  public password: string | null = null

  public waitingResponse: boolean = false

  public sendRequest(): void {
    const hasError: boolean = this.inputHasError(this.username, 50) || this.inputHasError(this.password, 50)
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
