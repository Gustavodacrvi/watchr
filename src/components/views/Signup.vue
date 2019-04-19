<template>
  <div class='signup body' :class='$store.getters.style("background")'>
    <div>
      <app-form v-column v-padding>
        <app-title class='form-margin'>Sign-up</app-title>
        <app-input class='form-margin' name='username' placeholder='Username:' :max='50' type='text'></app-input>
        <app-input class='form-margin' name='email' placeholder='E-mail:' :max='50' type='text'></app-input>
        <app-button class='form-margin'>Create account</app-button>
      </app-form>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Form from './../forms/Form.vue';
import Input from './../forms/Input.vue';
import Button from './../forms/Button.vue';
import Title from './../forms/Title.vue';

export default Vue.extend({
  components: {
    'app-form': Form,
    'app-input': Input,
    'app-button': Button,
    'app-title': Title,
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
