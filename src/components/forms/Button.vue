<template>
  <div class='form-button form-element'>
    <btn :type='type' @click='sendButtonEvent'>
      <span v-show='!showingIcon'><slot></slot></span>
      <icon v-show='showingIcon' ico='sync-alt fa-spin' sz='big'></icon>
    </btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Button from './../generalComponents/Button.vue';
import Icon from './../generalComponents/Icon.vue';
import { FormBus } from './Form.vue';

export default Vue.extend({
  components: {
    btn: Button,
    icon: Icon,
  },
  props: {
    type: String,
    icon: String,
  },
  data() {
    return {
      showingIcon: false,
    };
  },
  created() {
    FormBus.$off('loadIcon');

    FormBus.$on('loadIcon', (showIcon: boolean) => {
      this.showingIcon = showIcon;
    });
  },
  methods: {
    sendButtonEvent() {
      FormBus.$emit('submit');
    },
  },
});
</script>

<style scoped>

div.form-button {
  display: flex;
  justify-content: center;
}

div.form-button button {
  width: 90%;
}

</style>

