<template>
  <div class='margin password'>
    <form-input
      :placeholder='placeholder'
      :max='max'
      :type='passwordType'
      v-model='password'
      @state='e => passwordState = e'
    />
    <span class='eyes'>
      <transition
        name='fade'
        mode='out-in'
      >
        <ft-icon v-if="passwordType === 'text'"
          key='eye'
          class='eye txt icon pointer'
          icon='eye'
          size='1x'
          @click='togglePassword'
        ></ft-icon>
        <ft-icon v-else
          key='eye-slash'
          class='eye txt icon pointer'
          icon='eye-slash'
          size='1x'
          @click='togglePassword'
        ></ft-icon>
      </transition>
    </span>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'

import FormInput from '@/components/PopUps/FormComponents/FormInput.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faEye, faEyeSlash, faSync } from '@fortawesome/free-solid-svg-icons'

library.add(faEye, faEyeSlash, faSync)

@Component({
  components: {
    'form-input': FormInput,
  },
})
export default class FormPassword extends Vue {
  @State theme!: string
  @Prop(String) value!: string | null
  @Prop(String) placeholder!: string
  @Prop(Number) max!: number

  password: string | null = null
  passwordState: boolean = false
  passwordType: 'text' | 'password' = 'password'

  created() {
    this.password = this.value
  }

  togglePassword() {
    if (this.passwordType === 'text')
      this.passwordType = 'password'
    else
      this.passwordType = 'text'
  }

  @Watch('value')
  onValue() {
    this.password = this.value
  }
  @Watch('password')
  onModel() {
    this.$emit('input', this.password)
    this.$emit('state', this.passwordState)
  }
}

</script>

<style scoped src='@/assets/css/authPopUp.css'>
</style>
