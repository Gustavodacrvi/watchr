<template>
  <div id='navigation'>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  computed: {
    lang(): string {
      return this.$store.getters['lang/l'];
    },
  },
});
</script>

<style scoped>

#navigation {
  position: fixed;
  bottom: 0;
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
}

</style>
