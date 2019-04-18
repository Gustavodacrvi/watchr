<template>
  <div :class='$store.getters.cardRound'>
    <p>I am the form</p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>

<style scoped>

div {
  background-color: red;
  width: 450px;
}

</style>
