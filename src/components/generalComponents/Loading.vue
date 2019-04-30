<template>
  <div>
    <icon :class='$store.getters.style("icon-main-color")' ico='circle-notch fa-spin' sz='massive'></icon>
  </div>  
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

div {
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>

