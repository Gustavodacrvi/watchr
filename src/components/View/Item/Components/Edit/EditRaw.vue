<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="EditRaw">
      <div class="back-layer"></div>
      <div class="cont rb" ref='cont'>
        <div v-if="!hideIcons" class="icon-wrapper">
          <slot name="check-icon"></slot>
        </div>
        <span v-if="showName" class="input">
          {{ name }}
        </span>
      </div>
    </div>
  </transition>
</template>

<script>

export default {
  props: ['name'],
  data() {
    return {
      showName: false,
      hideIcons: false,
    }
  },
  mounted() {
    setTimeout(() => this.showName = true, 200)
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.addEventListener('click', this.windowClick)
  },
  methods: {
    windowClick(evt) {
      const path = evt.path || (evt.composedPath && evt.composedPath())
      let found
      for (const node of path)
        if (node === this.$refs['cont']) {
          found = true
          break
        }

      if (!found)
        this.close()
    },
    close() {
      this.showName = false
      this.hideIcons = true
      this.$emit('close')
    },
    enter(el, done) {

      const s = this.$refs['cont'].style

      s.transitionDuration = 0
      s.boxShadow = '0 0 0 transparent'
      s.backgroundColor = 'var(--ligth-gray)'

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.boxShadow = '0 4px 14px rgba(10,10,10,.3)'
        s.backgroundColor = 'var(--card)'

        setTimeout(done, 200)
      })

    },
    leave(el, done) {
      const s = this.$refs['cont'].style
      this.showName = false

      s.transitionDuration = 0
      s.boxShadow = '0 4px 14px rgba(10,10,10,.3)'
      s.backgroundColor = 'var(--card)'

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.boxShadow = '0 0 0 transparent'
        s.backgroundColor = 'var(--ligth-gray)'

        setTimeout(done, 200)
      })
    },
  },
}

</script>

<style scoped>

.EditRaw {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.cont {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 201;
}

.back-layer {
  z-index: 200;
  position: fixed;
  height: 100%;
  width: 100%;
  left: 0;
  top: 0;
}

.icon-wrapper {
  position: relative;
  height: 100%;
  width: 35px;
  flex-grow: 0;
  opacity: .4;
}

.input {
  display: flex;
  align-items: center;
}

</style>
