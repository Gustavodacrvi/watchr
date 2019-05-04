<template>
  <div class='dropdown-text-element'>
    <span><slot></slot></span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>

<style scoped>

.dropdown-text-element {
  margin: 8px;
  cursor: pointer;
}

</style>
