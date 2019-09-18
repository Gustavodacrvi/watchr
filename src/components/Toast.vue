<template>
  <div class="Toast">
    <transition name="trans">
      <div v-if="toast"
        class="toast cb rb"
        :class="[toast.type, {hasCallback: toast.callback}, $store.getters.platform]"
        @click="toastClick"
      >
        <span class="name">{{ toast.name }}</span>
      </div>
    </transition>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  data() {
    return {
      toast: null,
    }
  },
  methods: {
    addToast(toast) {
      this.toast = toast
      if (toast && toast.seconds) {
        setTimeout(() => {
          this.toast = null
          const toasts = this.toasts.slice()
          if (toasts.length > 0) {
            setTimeout(() => {
              this.addToast(toasts.pop())
              this.$store.commit('moveToastQueue')
            }, 250)
          }
        }, toast.seconds * 1000)
      }
    },
    toastClick() {
      if (this.toast.callback) {
        this.toast.callback()
      }
    }
  },
  computed: {
    ...mapState(['toasts']),
  },
  watch: {
    toasts() {
      const toasts = this.toasts.slice()
      if (!this.toast) {
        this.addToast(toasts.pop())
        this.$store.commit('moveToastQueue')
      }
    }
  }
}

</script>

<style scoped>

.Toast {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 150;
  pointer-events: none;
  overflow: hidden;
}

.toast {
  position: absolute;
  bottom: 40px;
  pointer-events: all;
  transition: background-color .2s;
}

.toast.desktop {
  left: 50%;
  transform: translateX(-50%);
}

.toast.mobile {
  margin: 0 32px;
}

.toast.success {
  border: 1px solid var(--green);
}

.toast.error {
  border: 1px solid var(--red);
}

.hasCallback {
  cursor: pointer;
}

.hasCallback:hover {
  background-color: var(--light-gray);
}

.name {
  display: inline-block;
  padding: 14px;
}

.trans-enter, .trans-leave-to {
  bottom: -120px;
  transition: bottom .2s ease-out;
}

.trans-leave, .trans-enter-to {
  bottom: 40px;
  transition: bottom .2s ease-in;
}

</style>
