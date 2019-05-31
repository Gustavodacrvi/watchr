<template>
  <div class='wrapper'>
    <div :ref='id' :id='id' :class='[$store.state.theme.style, state]' class='input' :tabindex='tabindex' @keypress='keyPress' @focus='focus = true' @blur='focus = false' @keydown='selectOptions' contenteditable='true'>
    </div>
    <transition name='fade-transition'>
      <div :class='$store.state.theme.style' ref='dropdown' class='dropdown card-round border' v-if='options !== undefined && options.length > 0 && focus'>
        <div v-for='opt in options' :key='opt' class='drop-element' :ref='opt' :class='[{"selected bright": selected === opt}, $store.state.theme.style]' @click='select(opt)'><span class='txt'>{{ opt }}</span></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

const returnEmptyIfUndefined = (input: string) => {
  if (input) {
    return input;
  } else {
    return '';
  }
}

export default Vue.extend({
  props: ['max', 'placeholder', 'tabindex', 'options', 'input', 'id'],
  data() {
    return {
      value: returnEmptyIfUndefined(this.input),
      state: undefined as any,
      focus: false,
      selected: '',
    };
  },
  mounted() {
    let div: any = this.$refs[this.id];
    div.innerHTML = this.value;
    div.addEventListener('input', this.textChange);
  },
  methods: {
    getCaretPosition() {
      let range = window.getSelection().getRangeAt(0);
      let selectedObj: any = window.getSelection();
      let rangeCount = 0;
      let childNodes = selectedObj.anchorNode.parentNode.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        if (childNodes[i] == selectedObj.anchorNode) {
          break;
        }
        if (childNodes[i].outerHTML)
          rangeCount += childNodes[i].outerHTML.length;
        else if (childNodes[i].nodeType == 3) {
          rangeCount += childNodes[i].textContent.length;
        }
      }
      return range.startOffset + rangeCount;
    },
    setCaretPosition(position: number) {
      let div: any = this.$refs[this.id];
      let range = document.createRange();
      let sel = window.getSelection();
      range.setStart(div.childNodes[0], position);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    },
    textChange() {
      let div: any = this.$refs[this.id];
      this.value = div.textContent;
      let position = this.getCaretPosition()
      div.innerHTML = this.value;
      this.setCaretPosition(position);
    },
    keyPress(key: any) {
      if (key.key === 'Enter') {
        if (this.selected === '') {
          this.$emit('enter');
        } else {
          if (this.options.length !== 0) {
            this.select(this.selected);
          }
        }
      }
    },
    select(option: string) {
      this.$emit('select', option);
      this.selected = '';
    },
    selectOptions(key: any) {
      if (this.options.length !== 0) {
        if (key.key === 'ArrowDown') {
          this.moveSelection('down');
        } else if (key.key === 'ArrowUp') {
          this.moveSelection('up');
        }
      }
    },
    moveSelection(direction: string) {
      const index = this.options.findIndex((arrayEl: any) => {
        return arrayEl === this.selected;
      });
      if (direction === 'up' && this.options[index - 1] !== undefined) {
        this.selected = this.options[index - 1];
      } else if (direction === 'down' && this.options[index + 1] !== undefined) {
        this.selected = this.options[index + 1];
      }
      // check if element is visible on dropdown
      let el: any = this.$refs[this.selected];
      el = el[0];
      const drop: any = this.$refs.dropdown;

      const belowScroll = drop.offsetHeight + drop.scrollTop < el.offsetTop;
      const uponScroll = drop.scrollTop > el.offsetTop;
      if (drop.offsetHeight + drop.scrollTop < el.offsetTop + el.offsetHeight) {
        drop.scrollTop = el.offsetTop - drop.offsetHeight + el.offsetHeight;
      } else if (drop.scrollTop > el.offsetTop) {
        drop.scrollTop = el.offsetTop;
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
  beforeDestroy() {
    let div: any = this.$refs[this.id];
    div.removeEventListener('input', this.textChange);
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
  overflow: auto;
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
  border-radius: 6px;
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
  outline: none;
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

.round .input {
  border-radius: 100px;
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
