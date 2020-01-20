<template>
  <div class="Toast" :class="$store.getters.platform">
    <transition name="trans">
      <div v-if="toast"
        class="toast cb rb shadow"
        :class="[toast.type, {hasCallback: toast.callback}]"
        @click="runCallback"
      >
        <span class="name" v-html="toast.name"></span>
        <div v-if="toast.callback" class="bubble">
          <CircleBubble
            innerColor='var(--light-gray)'
            outerColor='var(--fade)'
            opacity='0'
          />
        </div>
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
    runCallback() {
      if (this.toast && this.toast.callback) this.toast.callback()
    },
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
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 1000;
  pointer-events: none;
  overflow: hidden;
}

.toast {
  position: fixed;
  bottom: 40px;
  pointer-events: all;
  transition: background-color .15s;
}

.bubble {
  width: 100%;
  height: 100%;
  position: relative;
}

.Toast.desktop .toast {
  left: 50%;
  transform: translateX(-50%);
}

.Toast.mobile {
  display: flex;
  justify-content: center;
}

.Toast.mobile .toast {
  width: 92%;
}

.toast.success {
  border: .5px solid var(--green);
}

.toast.error {
  border: .5px solid var(--red);
}

.toast.warning {
  border: .5px solid var(--yellow);
}

.hasCallback {
  cursor: pointer;
  outline: 0;
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
  transition: bottom .3s ease-out;
}

.trans-leave, .trans-enter-to {
  bottom: 40px;
  transition: bottom .3s ease-in;
}

</style>
