<template>
  <div class='dropdown-text-element' @click='$emit("click")'>
    <span id='text'><slot></slot></span>
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

.dropdown-text-element:hover #text {
  color: #FE684F;
}

</style>
