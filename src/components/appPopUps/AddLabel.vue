<template>
  <div class='card-round pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <div class='wrapper'>
        <heading :simple='true' title='Help' :showing='false'>
          <span>You can create sub-labels using <span class='big'>:</span> .<br/><br/>
          E.g: family:spouse, work:people:karen, work:office.<br/><br/>The outer tag is automatically created when non existing.</span>
        </heading>
        <app-input class='stretch' @value-change='valueChange' @state-change='updateState' placeholder='E.g: 5 minutes, full focus, brain dead...'></app-input>
        <div class='options'>
          <btn class='medium' @click='add'>Add label</btn>
          <alert class='pointer' type='error' @click='$store.commit("app/nav/hidePopUp")'>Cancel</alert>
          {{ result }}
          <span class='right'>Press <strong>A + L</strong> to open this pop up.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/generalComponents/Heading.vue';
import Input from '@/components/appComponents/Input.vue';
import Button from '@/components/generalComponents/Button.vue';
import Alert from '@/components/generalComponents/Alert.vue';
import Heading from '@/components/appComponents/Heading.vue';

export default Vue.extend({
  components: {
    'app-title': Title,
    'app-input': Input,
    'btn': Button,
    'alert': Alert,
    'heading': Heading,
  },
  data() {
    return {
      inputState: false as boolean,
      result: undefined as any,
      value: '',
    };
  },
  methods: {
    valueChange(value: string) {
      this.value = value;
    },
    updateState(state: any) {
      this.inputState = !state.wrong;
    },
    add() {
      let tags = this.value.split(':');
      this.result = tags;
    },
  },
});
</script>

<style scoped>

.title {
  text-align: center;
}

.pop-up {
  flex-basis: 600px;
  padding: 0 18px;
  padding-bottom: 18px;
}

.wrapper {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.options{
  margin-top: 10px;
}

.alert {
  margin: 8px;
}

.big {
  font-size: 1.5em;
}

.right {
  float: right;
  clear: right;
}

</style>
