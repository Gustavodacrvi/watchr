<template>
  <transition :name='$store.getters.style("toast-transition")' :before-enter='showNext'>
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
    setTimeout(() => {
      ToastBus.$emit('addToast', {
        msg: 'I am a toast!',
        duration_seconds: 10,
        type: 'normal'
      } as ToastObj);
    }, 1000);
  },
  methods: {
    show(toast: ToastObj): void {
      if (toast.duration_seconds !== null) {
        setTimeout(() => this.showing = false, toast.duration_seconds * 1000);
      }
      this.showing = true;
      this.msg = toast.msg;
      this.type = toast.type;
    },
    showNext(): void {
      if (this.toasts.length !== 0) {
        this.show(this.toasts.pop() as any);
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

