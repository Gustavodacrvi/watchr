<template>
  <icon-group id='navigation' :desktop='true'></icon-group>
</template>

<script lang="ts">
import Vue from 'vue';
import IconGroup from './Icon-group.vue';

export default Vue.extend({
  components: {
    'icon-group': IconGroup,
  },
});
</script>

<style scoped>

#navigation {
  position: absolute;
  left: 0;
  top: 40%;
  transform: translateY(-50%);
  width: 60px;
  display: flex;
  flex-direction: column;
}

</style>
