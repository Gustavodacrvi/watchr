<template>
  <transition
    @enter='enter'
    @leave='leave'
  >
    <div v-if="content" class="header-info rb"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click="$emit('click')"
    >
      <span>{{ content }}</span>
    </div>
  </transition>
</template>

<script>

export default {
  props: ['content'],
  data() {
    return {
      hover: false,
    }
  },
  methods: {
    enter(el) {
      const s = el.style

      s.transitionDuration = '0s'
      s.opacity = '0'
      s.height = '0px'
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.height = '35px'
        s.opacity = '1'
      })
    },
    leave(el) {
      const s = el.style
      s.transitionDuration = '.2s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.opacity = '0'
    },
  }
}

</script>

<style scoped>

.header-info {
  height: 35px;
  display: inline-flex;
  padding: 0 8px;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform .2s;
}

.header-info:hover {
  background-color: var(--card);
}

.header-info:active {
  transform: scale(.9,.9);
}

</style>
