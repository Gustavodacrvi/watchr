<template>
  <div class='form-heading form-element'>
    <heading :lvl='1'><slot></slot></heading>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import Heading from '@/components/regular/Heading.vue';

export default Vue.extend({
  components: {
    heading: Heading,
  },
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

