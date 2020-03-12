<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <button class="Button cbd" :class="getType" @click="$emit('click')">{{ value }}
    </button>
  </transition>
</template>

<script>

export default {
  props: ['value', 'type'],
  methods: {
    enter(el, done) {
      const s = el.style

      const {height} = getComputedStyle(el)

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = 1

        setTimeout(done, 205)
      })
    },
    leave(el, done) {

      const s = el.style

      const {height, width} = getComputedStyle(el)

      s.transitionDuration = '.2s'
      s.height = 0
      s.opacity = 0

      setTimeout(done, 205)

    },
  },
  computed: {
    getType() {
      if (!this.type) return 'normal'
      return this.type
    },
  },
}

</script>

<style scoped>

.Button {
  width: 100%;
  border: none;
  padding: 8px;
  border-radius: 10px;
  font-size: 1.01em;
  cursor: pointer;
  transition-duration: .15s;
  outline: none;
  overflow: hidden;
  position: relative;
}

.Button.normal:hover, .Button.tiny:hover, .Button.normal:focus {
  background-color: var(--light-gray);
  color: white;
}

.tiny.normal {
  padding: 6px;
}

.no-back {
  background-color: var(--back-color);
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 6px;
}

.no-back:hover {
  background-color: var(--primary);
  color: white;
}

.dark, .card {
  display: inline-block;
  margin-top: 8px;
  width: unset;
  padding: 6px;
  color: var(--fade);
  transition-duration: .15s;
  transform: scale(1,1);
}

.no-padding {
  display: inline-block;
  transform: scale(1,1);
  padding: 2px;
  margin-top: 12px;
  margin-left: 6px;
  width: unset;
  transition-duration: .15s;
  color: var(--fade);
}

.no-padding:hover {
  color: var(--txt);
}

.dark:active, .card:active, .no-padding:active {
  transform: scale(.9,.9);
}

.dark {
  background-color: var(--sidebar-color);
}

.dark:hover {
  background-color: var(--light-gray);
}

.card {
  background-color: var(--card);
  color: var(--txt);
}

.card:hover {
  background-color: var(--light-gray);
}

</style>
