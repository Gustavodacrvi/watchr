<template>
  <article :class='$store.getters.style("card-round")' class='form'>
    <slot></slot>
  </article>
</template>

<script lang="ts">
import Vue from 'vue';

import { LogObject } from './../interfaces';

Vue.directive('column', {
  bind(el) {
    el.classList.add('column');
  },
});

Vue.directive('padding', {
  bind(el) {
    el.classList.add('padding');
  },
});

export const FormBus = new Vue();

export default Vue.extend({
  data() {
    return {
      logs: new Map(),
    };
  },
  created() {
    FormBus.$on('errorLog', (obj: LogObject) => {
      this.logs.set(obj.name, obj);
    });
  },
});
</script>

<style scoped>

article.form {
  width: 100%;
}

article.column {
  display: flex;
  flex-direction: column;
}

article.padding {
  padding: 4px 0;
}

.form-margin {
  margin: 10px 0;
}

</style>
