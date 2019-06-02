<template>
  <div class='wrapper'>
    <div :ref='id' :id='id' :class='[$store.state.theme.style, state]' class='input' :tabindex='tabindex' @keypress='keyPress' @focus='focus = true' @blur='focus = false' @keydown='keyDown' contenteditable='true'>
    </div>
    <div class='input placeholder' :class='state' v-if='showPlaceholder'><span>{{ placeholder }}</span></div>
    <transition name='fade-transition'>
      <div :class='$store.state.theme.style' ref='dropdown' class='dropdown card-round border' v-if='options !== undefined && options.length > 0 && focus'>
        <div v-for='opt in options' :key='opt' class='drop-element' :ref='opt' :class='[{"selected bright": selected === opt}, $store.state.theme.style]' @click='select(opt)'><span class='txt'>{{ opt }}</span></div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['max', 'placeholder', 'tabindex', 'options', 'input', 'id', 'tags'],
  data() {
    return {
      value: '' as string,
      state: undefined as any,
      focus: false,
      selected: '',
      showPlaceholder: true as any,
    };
  },
  mounted() {
    const div: any = this.$refs[this.id];
    if (this.input) {
      div.innerHTML = this.input;
    }
    div.addEventListener('input', this.textChange);
  },
  methods: {
    getNodeIndex(): number {
      const selection: any = window.getSelection();
      const currentNode: string = selection.focusNode.data;
      const childNodes = selection.anchorNode.parentNode.childNodes;
      const length = childNodes.length;
      for (let i = 0; i < length; i++) {
        if (childNodes[i].nodeType === 3 && childNodes[i].nodeValue === currentNode) {
          return i;
        }
      }
      return 0;
    },
    getCaretPosition() {
      const selection: any = window.getSelection();
      const caretPosition = selection.focusOffset;
    },
    setCaretPosition(node: number, position: number | undefined) {
      const div: any = this.$refs[this.id];
      const selection: any = window.getSelection();
      const range: any = document.createRange();
      if (position === undefined) {
        position = div.childNodes[node].length;
      }
      range.setStart(div.childNodes[node], position);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    },
    textChange() {
      const div: any = this.$refs[this.id];
      this.value = div.textContent;
    },
    updateInnerHTML() {
      const div: any = this.$refs[this.id];
      const node = this.getNodeIndex();
      div.innerHTML = this.value;
      this.setCaretPosition(node, undefined);
    },
    keyPress(key: any) {
      if (key.keyCode === 13) {
        key.preventDefault();
      }
      if (key.key === 'Enter') {
        if (this.selected === '') {
          this.$emit('enter');
        } else if (this.options.length !== 0) {
          this.select(this.selected);
        }
      }
    },
    select(option: string) {
      this.$emit('select', option);
      this.selected = '';
    },
    keyDown(key: any) {
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
      if (el !== undefined) {
        el = el[0];
        const drop: any = this.$refs.dropdown;
  
        const belowScroll = drop.offsetHeight + drop.scrollTop < el.offsetTop;
        const uponScroll = drop.scrollTop > el.offsetTop;
        if (drop.offsetHeight + drop.scrollTop < el.offsetTop + el.offsetHeight) {
          drop.scrollTop = el.offsetTop - drop.offsetHeight + el.offsetHeight;
        } else if (drop.scrollTop > el.offsetTop) {
          drop.scrollTop = el.offsetTop;
        }
      }
    },
    addTags() {
      /* if (this.tags !== undefined && this.tags.length !== 0) {
        this.addedTags = true;
        const div: any = this.$refs[this.id];
        const length = this.tags.length;
        for (let i = 0; i < length; i++) {
          div.innerHTML = div.childNodes[0].nodeValue.replace('' + this.tags[i].handle + this.tags[i].name, `<strong>${this.tags[i].name}</strong>&nbsp`);
          console.log(this.tags[i].handle + this.tags[i].name, div.childNodes[0])
        }
        this.setCaretToLast(div.childNodes.length - 1);
      } */
    },
    getInnerHTML() {
      const div: any = this.$refs[this.id];
      let text = '';
      const length = div.textContent.length;
      for (let i = 0; i < length; i++) {
        if (div.textContent.charCodeAt(i) === 160) {
          text += ' ';
        } else {
          text += div.textContent[i];
        }
      }
      return text;
    },
  },
  watch: {
    value() {
      this.showPlaceholder = this.value.length === 0;
      if (this.value.length === 0 || this.value.length > this.max) {
        this.state = 'wrong';
      } else {
        this.state = '';
      }
      this.$emit('value-change', this.getInnerHTML());
    },
    input() {
      if (this.getInnerHTML() !== this.input) {
        this.value = this.input;
        this.updateInnerHTML();
      }
    },
    state() {
      this.$emit('state-change', {
        state: this.state,
        wrong: this.state === 'wrong',
        value: this.getInnerHTML(),
      });
    },
  },
  beforeDestroy() {
    const div: any = this.$refs[this.id];
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

.placeholder {
  position: absolute;
  top: 0;
  pointer-events: none;
  opacity: .7;
}

.placeholder.wrong {
  border: 2px;
}

.fuck-yeah {
  background-color: red;
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
