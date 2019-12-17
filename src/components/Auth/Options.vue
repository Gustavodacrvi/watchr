<template>
  <div class="Options AuthOptions">
    <span class="element rb cb cursor bd" @click="showing = !showing">{{ active }}</span>
    <div v-if="showing" class="options-content rb cb bd thin-scroll"
      :style="{minWidth}"
    >
      <span v-for="o in options" :key="o"
        class="element opt cb cursor"
        :class="{active: o === active}"
        @click="select(o)"
      >{{ o }}</span>
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
        for (const node of evt.path)
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
  transition-duration: .2s;
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
  max-height: 300px;
  overflow: auto;
}

.opt {
  display: block;
}

.options-content {
  overflow: hidden;
}

</style>
