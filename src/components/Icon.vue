<template>
  <i :class='"fa fa-" + ico + " " + sz + " " + $store.getters.style("icon")'></i>  
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  props: {
    sz: String,
    ico: String,
  },
});
</script>

<style scoped>

.icon-light {
  font-size: 20px;
}

</style>

