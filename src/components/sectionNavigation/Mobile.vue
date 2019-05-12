<template>
  <icon-group id='navigation' :desktop='false'></icon-group>
</template>

<script lang="ts">
import Vue from 'vue';
import IconGroup from './Icon-group.vue';

export default Vue.extend({
  components: {
    'icon-group': IconGroup,
  },
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
