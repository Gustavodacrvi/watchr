<template>
  <div id='form' class='body background' :class='$store.state.theme.style'>
    <div id='centralize'>
      <div id='formContainer'>
        <app-form class='column padding' :act='submit' :load-icon='true'>
          <app-title class='form-margin'>{{ lang('signUpTitle') }}</app-title>
          <app-input class='form-margin' name='username' :placeholder='lang("passwordInputPlaceholder")' :max='50' type='text'></app-input>
          <app-input class='form-margin' name='email' :placeholder='lang("emailInputPlaceholder")' :max='50' type='text'></app-input>
          <confirm-password input-class='form-margin' name='password' :placeholder1='lang("newPasswordInputPlaceholder")' :placeholder2='lang("confirmPasswordInputPlaceholder")' :max='50'></confirm-password>
          <app-button class='form-margin'>{{ lang("createAccountButton") }}</app-button>
        </app-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import http from 'axios';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';
import Button from './../forms/Button.vue';
import Title from './../forms/Title.vue';
import ConfirmPassword from './../forms/ConfirmPassword.vue';
import router from '../../router';
import { ToastBus } from './../generalComponents/Toast.vue';
import { ToastObj } from './../interfaces';

import { FormBus } from './../forms/Form.vue';
import { InputErrorObject } from './../interfaces';

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
    'app-button': Button,
    'app-title': Title,
    'confirm-password': ConfirmPassword,
  },
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
  methods: {
    async submit(values: any) {
      await http.post('http://localhost:3000/signup', {
        username: values.username,
        email: values.email,
        password: values.password,
      }).then((res) => {
        if (res.data.error === 'usernameTaken') {
          FormBus.$emit('error', {
            name: 'username',
            msg: this.$store.getters['lang/l']('usernameTakenMsg'),
          } as InputErrorObject);
        } else if (res.data.error === 'emailTaken') {
          FormBus.$emit('error', {
            name: 'email',
            msg: this.$store.getters['lang/l']('emailTakenMsg'),
          } as InputErrorObject);
        } else {
          router.push('/login');
          ToastBus.$emit('addToast', {
            msg: this.$store.getters['lang/l']('successfullCreatedAccountToast'),
            duration_seconds: 5,
            type: 'success',
          } as ToastObj);
        }
      });
    },
  },
});
</script>

<style scoped>
@import 'Form-module.css';

</style>
