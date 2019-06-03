<template>
  <transition name='fade-transition' mode='out-in'>
    <div key='inbox-task-adder-msg' class='msg' v-if='!active'>
      <icon @click='active = true' ico='plus' sz='medium'></icon>
      <span @click='active = true' class='msg'>{{ msg }}</span>
    </div>
    <div v-else key='inbox-task-adder-adder' class='adder'>
      <div>
        <app-input tabindex='1' id='adder-input-rich-text' :class='$store.state.theme.style' class='stretch round' placeholder='Do something @interval #label $project %calendar_tag' :max='300' :options='[]' @value-change='updateValue' @state-change='updateState' @enter='addTask' :tags='inputTags'></app-input>
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
      tags: [] as string[] | null,
    };
  },
  methods: {
    getMatchesStringFromHandle(char: string, desired: string[]): string[] | null{
      const matches: string[] = [];
      const length: number = desired.length;
      for (let i = 0; i < length; i++) {
        if (this.value.search(new RegExp(`\\s${char}${desired[i]}`)) !== -1) {
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
    addTask() {

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
