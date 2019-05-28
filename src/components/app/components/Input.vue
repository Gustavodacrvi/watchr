<template>
  <div class='wrapper'>
    <input :class='[$store.state.theme.style, state]' class='input' name='input' autocomplete='off' :tabindex='tabindex' :placeholder='placeholder' v-model='value' @keypress='keyPress' @focus='focus = true' @blur='focus = false'/>
    <transition name='fade-transition'>
      <div :class='$store.state.theme.style' class='dropdown card-round border' v-if='options.length > 0 && focus'>
        <transition-group name='fade-transition'>
          <div v-for='opt in options' :key='opt' class='drop-element'><span>{{ opt }}</span></div>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['max', 'placeholder', 'tabindex', 'options'],
  data() {
    return {
      value: undefined as any,
      state: undefined as any,
      focus: false,
    };
  },
  methods: {
    keyPress(key: any) {
      if (key.key === 'Enter') {
        this.$emit('enter');
      }
    },
  },
  watch: {
    value() {
      if (this.value.length === 0 || this.value.length > this.max) {
        this.state = 'wrong';
      } else {
        this.state = '';
      }
      this.$emit('value-change', this.value);
    },
    state() {
      this.$emit('state-change', {
        state: this.state,
        wrong: this.state === 'wrong',
        value: this.value,
      });
    },
  },
});
</script>

<style scoped>

.wrapper {
  position: relative;
}

.dropdown {
  position: absolute;
  width: 100%;
  top: 100%;
  z-index: 3;
  max-height: 300px;
}

.drop-element {
  padding: 12px;
}

.drop-element + .drop-element {
  border-top: .5px solid rgba(230,230,230,.1);
}

.input {
  border: none;
  border-radius: 6px;
  padding: 8px;
  outline: none;
  font-family: 'Work Sans';
  font-size: 1.01em;
  transition-duration: .2s;
  bottom: 0;
}

.stretch {
  width: 100%;
  box-sizing: border-box;
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
  background-color: #f0f0f0 !important;
  color: #999999;
}

</style>
