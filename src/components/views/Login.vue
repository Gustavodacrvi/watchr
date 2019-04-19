<template>
  <div class='login'>
    <div>
      <app-form v-column>
        <app-title class='form-margin'>LOGIN</app-title>
        <app-input class='form-margin' name='username' placeholder='Username or e-mail:' :max='50' type='text'></app-input>
        <app-input class='form-margin' name='password' placeholder='Password:' :max='50' type='password'></app-input>
        <app-route class='form-margin' to='/' v-margin-left='"5%"'>Don't have an account? Sign up!</app-route>
        <app-button class='form-margin'>CLICK ME</app-button>
        <app-route class='form-margin' to='/' v-margin-left='"5%"'>Forgot account or username?</app-route>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';
import Link from './../forms/Link.vue';
import Button from './../forms/Button.vue';
import Title from './../forms/Title.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
    'app-route': Link,
    'app-button': Button,
    'app-title': Title,
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
  flex-basis: 500px;
}

</style>
