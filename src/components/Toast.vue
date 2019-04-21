<template>
  <article id='toast' :class='toastClass'>
    <span>{{ value }}</span>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      value: 'I am an awesome fucking Toast!!!',
    };
  },
  computed: {
    toastClass(): object {
      return [
        this.$store.getters.style('toast'),
        this.$store.getters.style('card-round'),
        this.$store.getters.style('shadow'),
      ];
    },
  },
});
</script>

<style scoped>

#toast {
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}

</style>

