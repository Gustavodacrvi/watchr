<template>
  <div id='body' class='background' :class='$store.state.style'>
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

<style>
@import './assets/css/main/button.css';
@import './assets/css/main/fontawesome.min.css';
@import './assets/css/main/icon.css';
@import './assets/css/main/input.css';
@import './assets/css/main/main.css';
@import './assets/css/main/toast.css';
@import './assets/css/main/transitions.css';

@import './assets/css/light/main.css';
@import './assets/css/light/toast.css';
@import './assets/css/light/input.css';

@import './assets/css/dark/main.css';
@import './assets/css/dark/toast.css';
@import './assets/css/dark/input.css';


#body {
  margin: 0;
}

#body {
  position: absolute;
  width: 100%;
  height: 100%;
}

</style>
