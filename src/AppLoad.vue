<template>
  <div id='body' class='background' :class='$store.state.theme.style'>
    <loading></loading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Loading from './components/generalComponents/Loading.vue';

export default Vue.extend({
  components: {
    loading: Loading,
  },
});
</script>

<style scoped>

.icon-main-color {
  color: #FE684F;
}

.background.dark {
  background-color: #1F1F1F;
}

.background.light {
  background-color: #f8f6f6;
}

#body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

i.massive {
  font-size: 100px;
}

</style>
