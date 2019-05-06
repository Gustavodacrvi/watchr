<template>
  <div class='login body background' :class='$store.state.theme.style'>
    <div>
      {{ $store.getters.l('hey') }}
      <app-form class='column padding' :act='submit' :load-icon='true'>
        <app-title class='form-margin'>{{ $store.getters.l('loginTitle') }}</app-title>
        <app-input class='form-margin' name='username' :placeholder='$store.getters.l("usernameInputPlaceholder")' :max='50' type='text'></app-input>
        <app-input class='form-margin' name='password' :placeholder='$store.getters.l("passwordInputPlaceholder")' :max='50' type='password'></app-input>
        <app-route class='form-margin' to='/signup' v-margin-left='"5%"'>{{ $store.getters.l("loginDontHavePasswordMsg") }}</app-route>
        <app-button class='form-margin'>{{ $store.getters.l("enterButton") }}</app-button>
        <app-route class='form-margin' to='/' v-margin-left='"5%"'>{{ $store.getters.l("loginForgotUsernameOrPasswordMessage") }}</app-route>
      </app-form>
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
  methods: {
    async submit(values: any) {
      await axios.post('http://localhost:3000/login', {
        username: values.username,
        password: values.password,
      }).then((res) => {
        if (res.data.error === 'usernameNotFound') {
          FormBus.$emit('error', {
            name: 'username',
            msg: this.$store.getters.l('usernameNotFoundInputMsg'),
          } as InputErrorObject);
        } else if (res.data.error === 'wrongPassword') {
          FormBus.$emit('error', {
            name: 'password',
            msg: this.$store.getters.l('wrongPasswordInputMsg'),
          } as InputErrorObject);
        } else {
          this.$store.commit('logUser', res.data.user);
          setCookie('watchrSessionToken', res.data.sessionToken, 30);
          router.push('/');
          ToastBus.$emit('addToast', {
            msg: this.$store.getters.l('successfullLoginToast'),
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

div.login {
  display: flex;
  justify-content: center;
  margin: 4px;
}

div.login > div {
  margin-top: 110px;
  flex-basis: 475px;
}

@media screen and (max-width: 801px) {
  div.login {
    padding: 25px 0;
  }
}

</style>
