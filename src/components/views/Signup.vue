<template>
  <div class='signup body background' :class='$store.state.theme.style'>
    <div>
      <app-form class='column padding' :act='submit' :load-icon='true'>
        <app-title class='form-margin'>{{ $store.getters['lang/l']('signUpTitle') }}</app-title>
        <app-input class='form-margin' name='username' :placeholder='$store.getters["lang/l"]("passwordInputPlaceholder")' :max='50' type='text'></app-input>
        <app-input class='form-margin' name='email' :placeholder='$store.getters["lang/l"]("emailInputPlaceholder")' :max='50' type='text'></app-input>
        <confirm-password input-class='form-margin' name='password' :placeholder1='$store.getters["lang/l"]("newPasswordInputPlaceholder")' :placeholder2='$store.getters["lang/l"]("confirmPasswordInputPlaceholder")' :max='50'></confirm-password>
        <app-button class='form-margin'>{{ $store.getters['lang/l']("createAccountButton") }}</app-button>
      </app-form>
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

div.signup {
  display: flex;
  justify-content: center;
  margin: 4px;
}

div.signup > div {
  margin-top: 90px;
  flex-basis: 475px;
}

@media screen and (max-width: 801px) {
  div.signup {
    padding: 25px 0;
  }
}

</style>
