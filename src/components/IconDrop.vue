<template>
  <div class="IconDrop" @click.stop>
    <Icon class="cursor" icon="sun" @click="showing = true"/>
    <transition name="drop-trans"
      @beforeEnter="afterEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-show="showing" class="content cb rb">
        <span class="link">I am the freaking link</span>
        <span class="link">I am the freaking link</span>
        <span class="link">I am the freaking link</span>
        <span class="link">I am the freaking link</span>
        <span class="link">I am the freaking link</span>
        <span class="link">I am the freaking link</span>
      </div>
    </transition>
  </div>
</template>

<script>

import IconVue from './Icon.vue'

export default {
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      showing: false,
      height: 0,
      width: 0,
    }
  },
  created() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    hide() {
      this.showing = false
    },
    leave(el) {
      el.style.width = 0
      el.style.height = 0
    },
    enter(el) {
      const { height, width } = getComputedStyle(el)
      
      el.style.width = 0
      el.style.height = 0

      setTimeout(() => {
        el.style.width = width
        el.style.height = height
      })
    },
    afterEnter(el) {
      el.style.width = 'auto'
      el.style.height = 'auto'
    }
  }
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.content {
  position: absolute;
  right: 0;
  top: 0;
  padding: 18px 0;
  overflow: hidden;
}

.link {
  display: block;
  padding: 6px 24px;
  cursor: pointer;
  transition-duration: .3s;
  white-space: nowrap;
}

.drop-trans-enter-active, .drop-trans-leave-active {
  transition-duration: .3s;
}

.drop-trans-enter-active .link {
  transition-duration: .5s;
  transition-delay: .25s;
}

.drop-trans-leave-active .link {
  transition-duration: .1s;
}

.drop-trans-enter .link, .drop-trans-leave-to .link {
  opacity: 0;
}

.drop-trans-leave .link, .drop-trans-enter-to .link {
  opacity: 1;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.2);
}

</style>
