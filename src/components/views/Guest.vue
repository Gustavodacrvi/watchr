<template>
  <div>
    <navigation></navigation>
  </div>
</template>

<script>
import Vue from 'vue';
import Navigation from './../sectionNavigation/Navigation.vue';

export default Vue.extend({
  components: {
    navigation: Navigation,
  },
});
</script>

<style scoped>

</style>
