<template>
  <div class='card-round pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <div class='wrapper'>
        <app-input class='stretch' @state-change='updateState'></app-input>
        <div class='options'>
          <btn class='left tiny'>Add label</btn>
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

export default Vue.extend({
  components: {
    'app-title': Title,
    'app-input': Input,
    'btn': Button,
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

.left {
  float: left;
  clear: left;
}

</style>
