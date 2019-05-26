<template>
  <div id='loading'>
    <icon class='icon-main-color' :class='$store.state.theme.style' ico='circle-notch fa-spin' sz='massive'></icon>
  </div>  
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/regular/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
});
</script>

<style scoped>

#loading {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>

