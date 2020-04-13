<template>
  <div class="Options AuthOptions">
    <div class="element rb cursor" @click="showing = !showing">{{ active }}</div>
    <div v-if="showing" class="options-content rb scroll-thin"
      :style="{minWidth}"
    >
      <div v-for="o in options" :key="o"
        class="element opt cb cursor"
        :class="{active: o === active}"
        @click="select(o)"
      >{{ o }}</div>
    </div>
  </div>
</template>

<script>

export default {
  props: ['options', 'active', 'minWidth'],
  data() {
    return {
      showing: false,
    }
  },
  beforeDestroy() {
    this.removeEvent()
  },
  methods: {
    select(val) {
      this.$emit('select', val)
      this.showing = false
    },
    hide(evt) {
      let hide = true
      if (evt) {
        let found = false
        const path = event.path || (event.composedPath && event.composedPath())
        for (const node of path)
          if (node.classList && node.classList.contains('AuthOptions')) {
            found = true
            break
          }
        hide = !found
      }

      if (hide) this.showing = false
    },
    addEvent() {
      window.addEventListener('click', this.hide)
    },
    removeEvent() {
      window.removeEventListener('click', this.hide)
    },
  },
  watch: {
    showing() {
      if (this.showing) this.addEvent()
      else this.removeEvent()
    }
  }
}

</script>

<style scoped>

.Options {
  display: inline-block;
  position: relative;
}

.element {
  display: inline-block;
  padding: 6px;
  transition-duration: .15s;
  background-color: var(--sidebar-color);
}

.element:hover {
  background-color: var(--light-gray);
}

.options-content {
  position: absolute;
  top: 100%;
  left: 0;
}

.options-content {
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;
}

.opt {
  display: block;
}

</style>
