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

          :style="{minHeight: getHeight + 'px'}"
        >
          <div v-show="!hideIcons" class="icon-wrapper" :class="{noColor: !iconColor}">
            <slot name="check-icon"
              :iconColor='iconColor'
            ></slot>
          </div>
          <div v-show="showCont"
            class="input"
          >
            <DropInput
              ref='first-field'
              v-model="model"
              :focus='true'
              class="no-back drop-input no-padding"
              :placeholder='editRawPlaceholder'
              :options='options'

              @click.native='fixCursor'
              @enter='save'
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
            
            @save='obj => $emit("save", obj)'
            
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
import List from "./List.vue"

import DropInput from "@/components/Auth/DropInput.vue"

export default {
  components: {
    List,
    Task, DropInput,
  },
  props: ['name', 'itemHeight', 'editComponent',  'doneTransition', 'editRawPlaceholder', 'item', 'itemModelFallback', 'isAdding', 'showInfo'],
  data() {
    return {
      model: this.name || '',
      options: [],
      iconColor: '',

      showCont: false,
      hideIcons: false,

      beginTransition: false,
    }
  },
  mounted() {
    setTimeout(() => {
      this.showCont = true
      this.$nextTick(() => this.focus())
    }, 200)
    window.addEventListener('click', this.windowClick)
  },
  beforeDestroy() {
    window.addEventListener('click', this.windowClick)
  },
  methods: {
    save() {
      this.$refs.comp.save()
    },
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
  
        s.height = this.getHeight + 'px'
  
        requestAnimationFrame(() => {
          s.transitionDuration = '.175s'
  
          s.boxShadow = '0 2px 8px rgba(15,15,15,.3)'
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
      s.boxShadow = '0 2px 8px rgba(15,15,15,.3)'
      s.overflow = 'hidden'
      s.backgroundColor = 'var(--card)'
      rootS.backgroundColor = 'var(--card)'

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          
          s.transitionDuration = '.175s'
          rootS.transitionDuration = '.175s'
          s.boxShadow = '0 0 0 transparent'

          if (this.isAdding) {
            s.height = 0
            rootS.height = 0
            s.backgroundColor = 'var(--back-color)'
            rootS.backgroundColor = 'var(--back-color)'
          } else {
            s.backgroundColor = 'var(--ligth-gray)'
            rootS.backgroundColor = 'var(--ligth-gray)'
            s.height = this.getHeight + 'px'
            rootS.height = this.getHeight + 'px'
          }
  
          setTimeout(() => {
            this.beginTransition = false
            this.doneTransition()
            if (this.isAdding)
              this.$parent.$parent.$parent.$emit('cancel')
            done()
          }, 200)
        })
      })
    },
  },
  computed: {
    getHeight() {
      return this.showInfo ? this.itemHeight + 6 : this.itemHeight
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
  width: 25px;
  flex-grow: 0;
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
  transform: translate(-1px, 1px);
}

</style>
