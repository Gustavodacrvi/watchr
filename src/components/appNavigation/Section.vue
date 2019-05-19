<template>
  <div class='section'>
    <icon class='pointer icon-color-hover' :ico='ico' sz='big-big'></icon>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Icon from '@/components/generalComponents/Icon.vue';

export default Vue.extend({
  components: {
    icon: Icon,
  },
  props: {
    ico: String,
  },
});
</script>
