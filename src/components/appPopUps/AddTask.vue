<template>
  <div class='card-round pop-up' :class='$store.state.theme.style'>
    <div class='title'>
      <app-title :lvl='3'>Add label</app-title>
    </div>
    <div class='input'>
      <app-input class='input-el'></app-input>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '@/components/generalComponents/Heading.vue';
import Input from '@/components/appComponents/Input.vue';

export default Vue.extend({
  components: {
    'app-title': Title,
    'app-input': Input,
  },
});
</script>

<style scoped>

.title {
  text-align: center;
}

.pop-up {
  flex-basis: 600px;
  padding-bottom: 18px;
}

.input {
  display: flex;
  justify-content: center;
}

.input-el {
  width: 85%;
}

</style>
