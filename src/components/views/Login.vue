<template>
  <div class='login'>
    <div>
      <app-form>
        <heading :lvl='1' v-align>LOGIN</heading>
        <app-input name='username' placeholder='Username or e-mail:' :max='50' type='text'></app-input>
        <app-input name='password' placeholder='Password:' :max='50' type='password'></app-input>
        <app-route to='/' v-margin='"5%"'>Don't have an account? Sign up!</app-route>
        <app-button>CLICK ME</app-button>
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

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
    'app-route': Link,
    'app-button': Button,
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
  margin-top: 120px;
  flex-basis: 500px;
}

</style>
