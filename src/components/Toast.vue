<template>
  <transition :name='$store.getters.style("toast-transition")' @after-leave='showNext'>
    <article v-show='showing' id='toast' class='toast' :class='toastClass'>
      <span>{{ msg }}</span>
    </article>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { ToastObj } from './interfaces';

export const ToastBus = new Vue();

export default Vue.extend({
  data() {
    return {
      msg: '',
      toasts: [

      ] as ToastObj[],
      showing: false,
      type: 'normal',
    };
  },
  created() {
    ToastBus.$on('addToast', (toast: ToastObj) => {
      if (!this.showing) {
        this.show(toast);
      } else {
        this.toasts.push(toast);
      }
    });
  },
  methods: {
    show(toast: ToastObj): void {
      this.showing = true;
      this.msg = toast.msg;
      this.type = toast.type;
      if (toast.duration_seconds !== null) {
        setTimeout(() => this.showing = false, toast.duration_seconds * 1000);
      }
    },
    showNext(): void {
      if (this.toasts.length !== 0) {
        this.show(this.toasts.shift() as any);
      } else {
        this.showing = false;
      }
    },
  },
  computed: {
    toastClass(): object {
      return [
        this.$store.getters.style('toast'),
        this.$store.getters.style('card-round'),
        this.$store.getters.style('shadow'),
        this.$store.getters.style('toast-' + this.type),
      ];
    },
  },
});
</script>

<style scoped>

.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}

</style>

