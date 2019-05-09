<template>
  <nav>
    <section>
    </section>
    <section>
      <icon></icon>
    </section>
  </nav>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from './Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
});
</script>

<style scoped>

nav {
  margin: 20px 18px;
}

nav > :nth-child(1) {
  float: left;
  clear: left;
}

nav > :nth-child(2) {
  float: right;
  clear: right;
}

</style>
