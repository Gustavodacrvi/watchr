<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="EditRaw">
      <div class="back-layer"></div>
      <div class="cont rb" ref='cont'>
        <div class="first-field">
          <div v-show="!hideIcons" class="icon-wrapper">
            <slot name="check-icon"></slot>
          </div>
          <span v-show="showCont" class="input">
            {{ name }}
          </span>
        </div>
        <transition name="fade-t">
          <component :is="editComponent"/>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>

import Task from "./Task.vue"

export default {
  components: {
    Task,
  },
  props: ['name', 'itemHeight', 'editComponent', 'hasFirstTextField', 'doneTransition'],
  data() {
    return {
      showCont: false,
      hideIcons: false,

      beginTransition: false,
    }
  },
  mounted() {
    setTimeout(() => this.showCont = true, 175)
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
      if (!this.beginTransition) {
        this.showCont = false
        this.hideIcons = true
        this.$emit('close')
      }
    },
    enter(el, done) {
      this.beginTransition = true

      const height = getComputedStyle(this.$refs['cont']).height

      const s = this.$refs['cont'].style

      s.transitionDuration = 0
      s.boxShadow = '0 0 0 transparent'
      s.backgroundColor = 'var(--ligth-gray)'

      s.height = this.itemHeight + 'px'

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.boxShadow = '0 4px 14px rgba(10,10,10,.3)'
        s.backgroundColor = 'var(--card)'
        s.height = height

        setTimeout(() => {
          s.height = 'auto'
          this.beginTransition = false
          done()
        }, 200)
      })

    },
    leave(el, done) {
      this.showCont = false
      this.hideIcons = true
      this.beginTransition = true
      const s = this.$refs['cont'].style
      const rootS = el.style

      const height = getComputedStyle(this.$refs['cont']).height


      s.transitionDuration = 0
      rootS.transitionDuration = 0
      
      s.height = height
      rootS.height = height
      s.boxShadow = '0 4px 14px rgba(10,10,10,.3)'
      s.backgroundColor = 'var(--card)'
      rootS.backgroundColor = 'var(--card)'

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          
          s.transitionDuration = '.2s'
          rootS.transitionDuration = '.2s'
          s.boxShadow = '0 0 0 transparent'
          s.backgroundColor = 'var(--ligth-gray)'
          rootS.backgroundColor = 'var(--ligth-gray)'
          s.height = this.itemHeight + 'px'
          rootS.height = this.itemHeight + 'px'
  
          setTimeout(() => {
            this.beginTransition = false
            this.doneTransition()
            done()
          }, 200)
        })
      })
    },
  },
}

</script>

<style scoped>

.EditRaw {
  position: relative;
  width: 100%;
  min-height: 100%;
  z-index: 1;
}

.cont {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 201;
}

.first-field {
  display: flex;
  height: 30px;
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
