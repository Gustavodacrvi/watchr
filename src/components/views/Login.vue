<template>
  <div id='authentication' class='body background' :class='$store.state.theme.style'>
    <div id='centralize'>
      <div id='formContainer'>
        <app-form class='column padding' :act='submit' :load-icon='true'>
          <app-title class='form-margin'>{{ lang('loginTitle') }}</app-title>
          <app-input class='form-margin' name='username' :placeholder='lang("usernameInputPlaceholder")' :max='50' type='text'></app-input>
          <app-input class='form-margin' name='password' :placeholder='lang("passwordInputPlaceholder")' :max='50' type='password'></app-input>
          <app-route class='form-margin' to='/signup' v-margin-left='"5%"'>{{ lang("loginDontHavePasswordMsg") }}</app-route>
          <app-button class='form-margin'>{{ lang("enterButton") }}</app-button>
          <app-route class='form-margin' to='/' v-margin-left='"5%"'>{{ lang("loginForgotUsernameOrPasswordMessage") }}</app-route>
        </app-form>
      </div>
    </div>    
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';
import Link from './../forms/Link.vue';
import Button from './../forms/Button.vue';
import Title from './../forms/Title.vue';

import router from '../../router';
import { FormBus } from './../forms/Form.vue';
import { InputErrorObject } from './../interfaces';
import { getCookie, setCookie } from './../../assets/javaScript/cookies';
import { ToastBus } from './../generalComponents/Toast.vue';
import { ToastObj } from './../interfaces';

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
    'app-route': Link,
    'app-button': Button,
    'app-title': Title,
  },
  computed: {
    lang(): (str: string) => string {
      return this.$store.getters['lang/l'];
    },
  },
  methods: {
    async submit(values: any) {
      await axios.post('http://localhost:3000/login', {
        username: values.username,
        password: values.password,
      }).then((res) => {
        if (res.data.error === 'usernameNotFound') {
          FormBus.$emit('error', {
            name: 'username',
            msg: this.lang('usernameNotFoundInputMsg'),
          } as InputErrorObject);
        } else if (res.data.error === 'wrongPassword') {
          FormBus.$emit('error', {
            name: 'password',
            msg: this.lang('wrongPasswordInputMsg'),
          } as InputErrorObject);
        } else {
          this.$store.commit('logUser', res.data.user);
          setCookie('watchrSessionToken', res.data.sessionToken, 30);
          router.push('/');
          ToastBus.$emit('addToast', {
            msg: this.lang('successfullLoginToast'),
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
@import 'FormModule.css';

</style>
