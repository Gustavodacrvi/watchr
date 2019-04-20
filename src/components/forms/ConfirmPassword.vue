<template>
  <div class='confirm-password'>
    <app-input :class='inputClass' name='password' :placeholder='placeholder1' :max='max' type='password'></app-input>
    <app-input :class='inputClass' name='password' :placeholder='placeholder2' :max='max' type='password'></app-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Input from './Input.vue';

export default Vue.extend({
  components: {
    'app-input': Input,
  },
  props: {
    name: String,
    max: Number,
    placeholder1: String,
    placeholder2: String,
    inputClass: String,
  },
});
</script>

<style scoped>

div.confirm-password {
  display: flex;
  flex-direction: column;
}

</style>
