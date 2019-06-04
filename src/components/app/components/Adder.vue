<template>
  <transition name='fade-transition' mode='out-in'>
    <div key='inbox-task-adder-msg' class='msg' v-if='!active' @click='active = true'>
      <icon ico='plus' sz='medium'></icon>
      <span class='msg'>{{ msg }}</span>
    </div>
    <div v-else key='inbox-task-adder-adder' class='adder'>
      <div>
        <app-input tabindex='1' id='adder-input-rich-text' :class='$store.state.theme.style' class='stretch round' placeholder='Do something @interval #label $project %calendar_tag' :max='300' :options='options' @value-change='updateValue' :input='input' @state-change='updateState' @enter='addTask' :tags='inputTags' @keydown='keydown' @select='selectTag'></app-input>
      </div>
      <div class='options'>
        <btn class='tiny-round tiny'>{{ btnMsg }}</btn>
        <alert class='pointer' @click='active = false' type='error'>Cancel</alert>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/regular/Icon.vue';
import Button from '@/components/regular/Button.vue';
import Alert from '@/components/regular/Alert.vue';
import Input from '@/components/app/components/Input.vue';

export default Vue.extend({
  props: {
    msg: String,
    btnMsg: String,
    tag: Boolean,
  },
  components: {
    'icon': Icon,
    'btn': Button,
    'alert': Alert,
    'app-input': Input,
  },
  data() {
    return {
      active: false,
      value: '',
      validInput: true,
      input: '',
      options: [] as string[],
      tags: [] as string[] | null,
      searchHandle: undefined as any,
      search: undefined as any,
      searchPosition: undefined as any,
    };
  },
  methods: {
    getMatchesStringFromHandle(char: string, desired: string[]): string[] | null{
      const matches: string[] = [];
      const length: number = desired.length;
      for (let i = 0; i < length; i++) {
        if (this.value.search(new RegExp(`\\s${char}${desired[i]}(?![a-z|0-9])`)) !== -1) {
          matches.push(desired[i]);
        }
      }

      return matches;
    },
    updateValue(value: string) {
      this.value = value;

      
      if (this.tag) {
        const possibleValues = this.$store.getters['app/tag/getAllPossibleLabelBranchesInString']();
        
        this.tags = this.getMatchesStringFromHandle('#', possibleValues);
      }
    },
    updateState(state: any) {
      this.validInput = !state.wrong;
    },
    keydown({ key, caretPosition }: any) {
      if (this.tags && key === '#') {
        this.search = '';
        this.searchHandle = '#';
        this.searchPosition = caretPosition;
      } else if (key === ' ') {
        this.searchHandle = undefined;
        this.search = undefined;
      } else if (key === 'Backspace' && this.search !== undefined) {
        this.search = this.search.slice(0, -1);
      } else if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'Enter' && key !== 'Control' && key !== 'Shift' && key !== 'Alt' && key !== 'Tab') {
        this.search += key;
      }
      this.updateSearchOptions();
    },
    updateSearchOptions() {
      if (this.tag && this.searchHandle === '#') {
        const tags = this.$store.getters['app/tag/getSubLabelsFromBranchSearch'](this.$store.getters['app/tag/parseStringBranchToArrayBranch'](this.search, true));
        this.options = this.$store.getters['app/tag/getArrayOfNamesOutOfArrayOfTags'](tags);
      } else {
        this.options = [];
      }
    },
    selectTag(name: string) {
      let str = this.value.substring(0, this.searchPosition) + this.value.substring(this.searchPosition + this.search.length + 1);

      if (str[str.length - 1] !== ' ') {
        str += ' ';
      }

      this.input = '';
      this.input = str + this.searchHandle + name;
      this.updateSearchOptions();
    },
    addTask() {
      if (this.tag && this.searchHandle === '#') {
        const tags = this.$store.getters['app/tag/getSubLabelsFromBranchSearch'](this.$store.getters['app/tag/parseStringBranchToArrayBranch'](this.search));
        this.options = this.$store.getters['app/tag/getArrayOfNamesOutOfArrayOfTags'](tags);
      } else {
        this.options = [];
      }
    },
  },
  computed: {
    inputTags() {
      const inputTags: any = [];
      if (this.tags !== null) {
        const length = this.tags.length;
        for (let i = 0; i < length; i++) {
          inputTags.push({
            name: this.tags[i],
            handle: '#',
            color: '#FC7C85',
            ico: 'tag',
          });
        }
      }
      return inputTags;
    },
  },
});
</script>

<style scoped>

.msg {
  margin: 16px 0;
  height: 30px;
  display: flex;
  align-items: center;
  color: #A97CFC;
  margin-left: 10px;
  cursor: pointer;
}

.icon {
  color: #A97CFC;
  cursor: pointer;
}

.options {
  margin-top: 6px;
}

.adder {
  display: flex;
  flex-direction: column;
}

.alert {
  margin: 6px;
}

</style>
