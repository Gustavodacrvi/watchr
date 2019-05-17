<template>
  <div id='navigation' :class='$store.state.theme.style'>
    <icon-group id='icon-group' :desktop='false'></icon-group>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import IconGroup from './IconGroup.vue';

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
}

#navigation.light {
  background-color: #FAFAF9;
  box-shadow: 0 5px 30px 40px #FAFAF9;
}

#navigation.dark {
  background-color: #1F1F1F;
  box-shadow: 0 5px 30px 40px #1F1F1F;
}

#icon-group {
  position: relative;
  top: -5px;
  display: flex;
  height: 100%;
  align-items: center;
}

</style>
