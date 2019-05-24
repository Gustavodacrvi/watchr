<template>
  <input :class='[$store.state.theme.style, state]' class='input' name='input' :placeholder='placeholder' autocomplete='off' v-model='value'/>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    placeholder: String,
  },
  data() {
    return {
      value: undefined as any,
      state: '',
    };
  },
  watch: {
    value() {
      if (this.value.length === 0) {
        this.state = 'wrong';
      } else {
        this.state = '';
      }
    },
  },
});
</script>

<style scoped>

.input {
  position: relative;
  border: none;
  border-radius: 6px;
  padding: 8px;
  outline: none;
  font-family: 'Work Sans';
  font-size: 1.01em;
  transition-duration: .2s;
  bottom: 0;
}

.input.wrong {
  border: 2px solid #ec554d !important;
  box-shadow: 0 0 2px #ec554d;
}

.input.dark {
  background-color: #363636;
  color: #9C9696;
}

.input.light {
  background-color: #F1F1F3;
}

</style>
