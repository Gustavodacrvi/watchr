<template>
  <div class='form-heading form-element'>
    <heading :lvl='1'><slot></slot></heading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
});
</script>

<style scoped>

.form-heading {
  text-align: center;
}

.form-margin {
  margin: 0;
}

</style>

