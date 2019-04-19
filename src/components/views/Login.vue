<template>
  <div class='login'>
    <div>
      <app-form>
        <heading :lvl='1' v-align>Login</heading>
        <app-input name='username' placeholder='Username or e-mail:' :max='50' type='text'></app-input>
        <app-input name='password' placeholder='Password:' :max='50' type='password'></app-input>
        <route to='/'>Don't have an account? Sign up!</route>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
  },
});
</script>

<style scoped>

div.login {
  display: flex;
  justify-content: center;
}

div.login > div {
  margin-top: 120px;
  flex-basis: 500px;
}

</style>
