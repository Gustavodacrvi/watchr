<template>
  <icon-group id='navigation'></icon-group>
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
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 75px;
  display: flex;
  flex-direction: column;
}

</style>
