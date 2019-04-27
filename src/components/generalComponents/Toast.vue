<template>
  <transition :name='$store.getters.style("toast-transition")' @after-leave='showNext'>
    <article v-show='showing' id='toast' class='toast' :class='toastClass'>
      <span>{{ msg }}</span>
      <span v-if='infiniteToast' class='toast-icon'>
        <icon ico='times' sz='big' @click='showing = false' v-cursor></icon>
      </span>
    </article>
  </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { ToastObj } from './../interfaces';

import Icon from './../generalComponents/Icon.vue';

export const ToastBus = new Vue();

export default Vue.extend({
  components: {
    icon: Icon,
  },
  data() {
    return {
      msg: '',
      toasts: [

      ] as ToastObj[],
      showing: false,
      type: 'normal',
      infiniteToast: false,
    };
  },
  created() {
    ToastBus.$off('addToast');
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
      this.infiniteToast = false;
      this.msg = toast.msg;
      this.type = toast.type;

      if (toast.duration_seconds !== null && toast.duration_seconds !== 0) {
        setTimeout(() => this.showing = false, toast.duration_seconds * 1000);
      } else {
        this.infiniteToast = true;
        this.showing = true;
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
  min-height: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.toast > span {
  padding: 10px;
}

.toast-icon {
  padding-left: 12px;
  padding-right: 4px;
}

</style>

