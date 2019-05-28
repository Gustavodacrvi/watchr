<template>
  <div class='wrapper'>
    <input :class='[$store.state.theme.style, state]' class='input' name='input' autocomplete='off' :tabindex='tabindex' :placeholder='placeholder' v-model='value' @keypress='keyPress' @focus='focus = true' @blur='focus = false' @keydown='selectOptions'/>
    <transition name='fade-transition'>
      <div :class='$store.state.theme.style' class='dropdown card-round border' v-if='options.length > 0 && focus'>
        <div v-for='opt in options' :key='opt' class='drop-element' :class='[{"selected bright": selected === opt}, $store.state.theme.style]'><span class='txt'>{{ opt }}</span></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['max', 'placeholder', 'tabindex', 'options', 'input'],
  data() {
    return {
      value: this.input as string,
      state: undefined as any,
      focus: false,
      selected: '',
    };
  },
  methods: {
    keyPress(key: any) {
      if (key.key === 'Enter') {
        if (this.selected === '') {
          this.$emit('enter');
        } else {
          this.$emit('select', this.selected);
          this.selected = '';
        }
      }
    },
    selectOptions(key: any) {
      if (key.key === 'ArrowDown') {
        this.moveSelection('down');
      } else if (key.key === 'ArrowUp') {
        this.moveSelection('up');
      }
    },
    moveSelection(direction: string) {
      const index = this.options.findIndex((el: any) => {
        return el === this.selected;
      });
      if (direction === 'up' && this.options[index - 1] !== undefined) {
        this.selected = this.options[index - 1];
      } else if (this.options[index + 1] !== undefined) {
        this.selected = this.options[index + 1];
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
    input() {
      this.value = this.input;
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
  overflow: hidden;
}

.drop-element {
  padding: 12px;
  cursor: pointer;
  transition: background-color .2s;
}

.drop-element:hover {
  background-color: #3d3d3d;
}

.selected .txt, .drop-element:hover .txt {
  color: #A97CFC;
  text-shadow: 0 0 1px solid #A97CFC;
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
