<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="EditRaw">
      <div class="back-layer"></div>
      <div class="cont rb" ref='cont'>
        <div
          class="first-field"
          @pointerdown.stop
        >
          <div v-show="!hideIcons" class="icon-wrapper" :class="{noColor: !iconColor}">
            <slot name="check-icon"
              :iconColor='iconColor'
            ></slot>
          </div>
          <div v-show="showCont" class="input">
            <DropInput
              ref='first-field'
              v-model="model"
              :focus='true'
              class="no-back drop-input"
              :placeholder='editRawPlaceholder'
              :options='options'

              @click.native='fixCursor'
              @select='select'
              @cancel='$emit("close")'
            />
          </div>
        </div>
        <transition name="fade-t">
          <component :is="editComponent"
            ref='comp'
            v-model="model"
            :item='item'
            :itemModelFallback='itemModelFallback'
            :firstFieldOptions='options'
            
            @icon-color='v => iconColor = v'
            @focus-on-field='focus'
            @remove-focus='removeFocus'
            @cancel='close'
            @set-first-field-options='v => options = v'
          />
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>

import Task from "./Task.vue"

import DropInput from "@/components/Auth/DropInput.vue"

export default {
  components: {
    Task, DropInput,
  },
  props: ['name', 'itemHeight', 'editComponent',  'doneTransition', 'editRawPlaceholder', 'item', 'itemModelFallback'],
  data() {
    return {
      model: this.name,
      options: [],
      iconColor: '',

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
    fixCursor() {
      this.$refs.comp.cursorPos = 0
    },
    removeFocus() {
      this.$refs['first-field'].removeFocus()
    },
    focus() {
      this.$refs['first-field'].focusInput(0)
    },
    select(val) {
      this.$refs.comp.select(val)
    },
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

      requestAnimationFrame(() => {
        const height = this.$refs['cont'].getBoundingClientRect().height
  
        const s = this.$refs['cont'].style
  
        s.transitionDuration = 0
        s.boxShadow = '0 0 0 transparent'
        s.backgroundColor = 'var(--light-gray)'
        s.overflow = 'hidden'
  
        s.height = this.itemHeight + 'px'
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
  
          s.boxShadow = '0 2px 18px rgba(10,10,10,.45)'
          s.backgroundColor = 'var(--card)'
          s.height = height + 'px'
  
          setTimeout(() => {
            s.height = 'auto'
            s.overflow = 'unset'
            this.beginTransition = false
            done()
          }, 200)
        })
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
      s.overflow = 'hidden'
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
  watch: {
    name() {
      this.model = this.name
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
  z-index: 201;
}

.first-field {
  position: relative;
  display: flex;
  align-items: stretch;
  min-height: 35px;
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
  position: absolute;
  height: 100%;
  width: 35px;
  flex-grow: 0;
}

.icon-wrapper.noColor {
  opacity: .4;
}

.input {
  padding-right: 0px;
  display: flex;
  width: 100%;
  align-items: center;
}

.drop-input {
  width: 100%;
  font-size: 1.05m;
  margin-left: 26px;
}

</style>
