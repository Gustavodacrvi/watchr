<template>
  <transition name='fade-transition' mode='out-in'>
    <div key='inbox-task-adder-msg' class='msg' v-if='!active'>
      <icon @click='active = true' ico='plus' sz='medium'></icon>
      <span @click='active = true' class='msg'>{{ msg }}</span>
    </div>
    <div v-else key='inbox-task-adder-adder' class='adder'>
      <div>
        <app-input tabindex='1' id='adder-input-rich-text' :class='$store.state.theme.style' class='stretch round' placeholder='Do something @interval #label $project %calendar_tag' :max='300' :options='tagNames' @value-change='updateValue' @state-change='updateState' @enter='addTask'></app-input>
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
      tagNames: [] as string[],
    };
  },
  methods: {
    updateValue(value: string) {
      this.value = value;

      const index = value.search(/\s#/);
      if (index !== -1) {
        let target = value.slice(index + 2);
        console.log(target[target.length - 1] === ' ')
        if (target[target.length - 1] === ' ') {
          target = target.substring(0, target.length - 1);
        }
        const labels = target.split(' ');
        const length = labels.length;
        const labelCombinations = [];
        for (let i = 0; i < length; i++) {
          let comb = '';
          for (let j = 0; j < i + 1; j++) {
            if (labels[j] !== '') {
              comb += ' ' + labels[j];
            }
          }
          if (comb.length !== 0) {
            labelCombinations.push(comb);
          }
        }
        const arrayBranch = this.$store.getters['app/tag/parseStringBranchToArrayBranch'](target, false);
        const tags = this.$store.getters['app/tag/getSubTagsFromBranchSearch'](arrayBranch);
        this.tagNames = this.$store.getters['app/tag/getArrayOfNamesOutOfArrayOfTags'](tags);
      } else {
        this.tagNames = [];
      }
    },
    updateState(state: any) {
      this.validInput = !state.wrong;
    },
    addTask() {

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
}

.icon {
  color: #A97CFC;
  cursor: pointer;
}

.msg {
  color: #A97CFC;
  cursor: pointer;
  margin-left: 10px
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
