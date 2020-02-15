<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div
      class="header-info rb"
      :class="{number}"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click.stop='click'
    >
      <span v-show="number" class="num">{{ number }}</span>
      <Icon
        class="icon faded"
        :icon="icon"
        :title='title'
        :width='icon === "file" ? "19px" : undefined'
      />
      <span v-show="content || right">
        <transition
          @enter='contentEnter'
          @leave='contentLeave'
        >
          <span v-if="content" class="cont">{{ content }}</span>
        </transition>
        <transition
          @enter='contentEnter'
          @leave='contentLeave'
        >
          <span v-if="right" class="faded cont">{{ right }}</span>
        </transition>
      </span>
      <input v-show="false"
        ref='file'
        type='file'
        @click.stop
        @change='handleFile'
      >
    </div>
  </transition>
</template>

<script>

import utils from '@/utils'

export default {
  props: ['content', 'right', 'icon', 'options', 'title', 'number'],
  data() {
    return {
      hover: false,
    }
  },
  mounted() {
    this.bindContext()
  },
  methods: {
    bindContext() {
      if (this.options)
        utils.bindOptionsToEventListener(this.$el, this.options, this, 'click')
    },
    click() {
      if (this.icon === 'file' && this.fileInput)
        this.fileInput.click()
    },
    handleFile() {
      const inp = this.fileInput
      if (inp.files[0])
        this.$emit('add', inp.files[0])
      inp.value = ''
    },

    enter(el, done) {
      const s = el.style

      s.transitionDuration = '0s'
      s.opacity = '0'
      s.height = '0px'
      s.width = 0
      s.overflow = 'hidden'
      s.padding = '0'
      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.height = '35px'
        s.padding = '0 8px'
        s.width = '35px'
        s.opacity = '1'

        setTimeout(() => {
          s.overflow = 'visible'
          s.width = 'auto'
          done()
        }, 255)
      })
    },
    leave(el, done) {
      const s = el.style
      s.transitionDuration = '.15s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.padding = '0'
      s.width = '0px'
      s.opacity = '0'

      setTimeout(done, 255)
    },

    contentEnter(el, done) {

      const s = el.style

      const {width} = getComputedStyle(el)
      
      s.transitionDuration = 0
      s.width = 0
      s.marginLeft = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'

        s.width = width
        s.marginLeft = '6px'
        s.opacity = 1

        setTimeout(done, 305)
      })

    },
    contentLeave(el, done) {
      const s = el.style
      

      const {width} = getComputedStyle(el)

      s.transitionDuration = 0
      s.width = width
      s.opacity = 1
      s.marginLeft = '6px'

      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'
        s.width = 0
        s.marginLeft = 0
        s.opacity = 0
  
        setTimeout(done, 305)
      })
    },
  },
  computed: {
    fileInput() {
      return this.$refs['file']
    },
  },
  watch: {
    options() {
      this.bindContext()
    },
  },
}

</script>

<style scoped>

.faded {
  opacity: .6;
  transition: opacity .2s;
}

.number .faded {
  opacity: 1;
}

.num {
  position: absolute;
  right: -5px;
  bottom: -5px;
}

.header-info {
  height: 35px;
  position: relative;
  display: inline-flex;
  padding: 0 8px;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  overflow: visible;
}

.cont {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  margin-left: 6px;
  overflow: hidden;
}

.icon {
  transform: translateY(2px);
  overflow: hidden;
}

.header-info:hover {
  background-color: var(--light-gray);
}

.header-info:active {
  transform: scale(.9,.9);
}

</style>
