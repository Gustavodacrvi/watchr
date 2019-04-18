<template>
  <div class='login'>
    <div>
      <app-form>
        <heading :lvl='1' v-align>Login</heading>
        <app-input name='username' placeholder='Username or e-mail: ' :max='100' type='text'></app-input>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Heading from './../Heading.vue';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
    'heading': Heading,
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
