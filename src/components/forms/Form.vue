<template>
  <article :class='$store.getters.style("card-round")' class='form'>
    <slot></slot>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';

export const bus = new Vue();
interface LogObject {
  name: string;
  value: any;
  error: boolean;
}

export default Vue.extend({
  data() {
    return {
      logs: new Map(),
    };
  },
  created() {
    bus.$on('errorLog', (obj: LogObject) => {
    });
  },
});
</script>

<style scoped>

article.form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

</style>
