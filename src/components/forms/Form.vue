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

interface SubmitObj {
  [index: string]: any;
}

export default Vue.extend({
  props: {
    act: Function,
  },
  data() {
    return {
      logs: new Map(),
    };
  },
  created() {
    FormBus.$on('errorLog', (obj: LogObject) => {
      this.logs.set(obj.name, obj);
    });
    FormBus.$on('submit', () => {
      if (!this.hasError()) {
        const entries = this.logs.values();
        const obj: SubmitObj = {};
        for (const el of entries) {
          obj[el.name] = el.value;
        }
        this.act(obj);
      }
    });
  },
  methods: {
    hasError(): boolean {
      const entries = this.logs.values();
      for (const el of entries) {
        if (el.error) {
          return true;
        }
      }
      return false;
    },
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
