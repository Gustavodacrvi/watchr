<template>
  <div class='signup body' :class='$store.getters.style("background")'>
    <div>
      <app-form v-column v-padding :act='submit' :load-icon='true'>
        <app-title class='form-margin'>Sign-up</app-title>
        <app-input class='form-margin' name='username' placeholder='Username:' :max='50' type='text'></app-input>
        <app-input class='form-margin' name='email' placeholder='E-mail:' :max='50' type='text'></app-input>
        <confirm-password input-class='form-margin' name='password' placeholder1='New password:' placeholder2='Confirm your password:' :max='50'></confirm-password>
        <app-button class='form-margin'>Create account</app-button>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import http from 'axios';

import Form from './../forms/Form.vue';
import { FormBus } from './../forms/Form.vue';
import Input from './../forms/Input.vue';
import Button from './../forms/Button.vue';
import Title from './../forms/Title.vue';
import ConfirmPassword from './../forms/ConfirmPassword.vue';
import router from '../../router';

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
            msg: 'Username taken, please choose another one.',
          } as InputErrorObject);
        } else if (res.data.error === 'emailTaken') {
          FormBus.$emit('error', {
            name: 'email',
            msg: 'Email taken, please choose another one.',
          } as InputErrorObject);
        } else {
          router.push('/login');
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
  margin-top: 110px;
  flex-basis: 475px;
}

@media screen and (max-width: 801px) {
  div.signup {
    padding: 25px 0;
  }
}

</style>
