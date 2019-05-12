<template>
  <div id='navigation'>
    <icon-group id='icon-group' :desktop='false'></icon-group>
  </div>
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
  left: 0;
  height: 40px;
  box-sizing: border-box;
  padding: 0 5px;
  width: 100%;
  z-index: 1;
  background-color: #FAFAF9;
  box-shadow: 0 5px 30px 40px #FAFAF9;
}

#icon-group {
  position: relative;
  top: -5px;
  display: flex;
  height: 100%;
  align-items: center;
}

</style>
