<template>
  <div id='app-navigation' :class='$store.state.theme.style'>
    asdf
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
});
</script>

<style scoped>

#app-navigation.light {
  background-color: #EEEDED;
  box-shadow: inset 0 0 6px #b4b4b4;
}

#app-navigation.dark {
  background-color: #282828;
}

#app-navigation {
  position: fixed;
  width: 280px;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 5;
}

</style>
