<template>
  <transition
    @enter='enter'
    @leave='leave'
  >
    <div v-show="content" class="header-info rb"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click="$emit('click')"
    >
      <Icon class="mg faded" :icon="icon"/>
      <span v-if="hover" class="mg faded">{{ info }}</span>
      <span class="mg">{{ content }}</span>
      <span class="mg"></span>
      <span class="faded">{{ left }}</span>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

export default {
  props: ['content', 'props', 'info', 'left', 'icon'],
  components: {
    Icon,
  },
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
      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.height = '35px'
        s.opacity = '1'
      })
    },
    leave(el) {
      const s = el.style
      s.transitionDuration = '.15s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.opacity = '0'
    },
  }
}

</script>

<style scoped>

.mg {
  margin-right: 6px;
}

.faded {
  opacity: .6;
}

.header-info {
  height: 35px;
  display: inline-flex;
  padding: 0 8px;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform .15s;
}

.header-info:hover {
  background-color: var(--card);
}

.header-info:active {
  transform: scale(.9,.9);
}

</style>
