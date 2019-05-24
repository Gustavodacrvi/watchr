<template>
  <transition name='fade-transition'>
    <div class='section-input' v-if='show'>
      <input :class='$store.state.theme.style' class='input' name='input' :placeholder='placeholder' autocomplete='off' v-model='value'/>      
    </div>
  </transition>  
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    placeholder: String,
    show: Boolean,
  },
  data() {
    return {
      value: '',
    };
  },
});
</script>

<style scoped>

</style>

