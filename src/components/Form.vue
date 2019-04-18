<template>
  <div :class='$store.getters.style("card-round")'>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>

<style scoped>

div {
  width: 450px;
}

</style>
