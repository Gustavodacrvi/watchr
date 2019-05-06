<template>
  <div>
    <icon class='icon-main-color' :class='$store.state.theme.style' ico='circle-notch fa-spin' sz='massive'></icon>
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

