<template>
  <div class='card-round pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <div class='wrapper'>
        <heading>fds</heading>
        <app-input class='stretch' @state-change='updateState' placeholder='E.g: 5 minutes, full focus, work, family...'></app-input>
        <div class='options'>
          <btn class='medium'>Add label</btn>
          <alert class='pointer' type='error'>Cancel</alert>
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
    };
  },
  methods: {
    updateState(state: any) {
      this.inputState = !state.wrong;
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

</style>
