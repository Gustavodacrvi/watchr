<template>
  <nav id='mobile-nav'>
    <section id='mobile-nav-left'>
    </section>
    <section id='mobile-nav-right'>
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

#mobile-nav {
  margin: 20px 18px;
}

#mobile-nav-left {
  float: left;
  clear: left;
}

#mobile-nav-right {
  float: right;
  clear: right;
}

</style>
