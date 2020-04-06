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
        :color='color'
        :width='icon === "file" ? "12px" : undefined'
      />
      <span v-show="content || right">
        <transition
          @enter='contentEnter'
          @leave='contentLeave'
        >
          <span v-if="content && doneAnimation" class="cont">{{ content }}</span>
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
        multiple='true'
        type='file'
        @click.stop
        @change='handleFile'
      >
    </div>
  </transition>
</template>

<script>

export default {
  props: ['content', 'right', 'icon', 'options', 'title', 'number', 'color'],
  data() {
    return {
      hover: false,
      doneAnimation: false,
    }
  },
  methods: {
    openOptions() {
      if (this.options)
        this.$store.commit('pushIconDrop', this.options)
    },
    click() {
      if (this.icon === 'file' && this.fileInput)
        this.fileInput.click()
      else this.openOptions()
    },
    handleFile() {
      const inp = this.fileInput
      if (inp.files.length > 15) {
        this.$store.commit('pushToast', {
          name: "You can't have more than 15 files.",
          seconds: 5,
          type: 'error',
        })
      } else {
        if (inp.files.length > 0)
          this.$emit('add', inp.files)
      }
      inp.value = ''
    },

    enter(el, done) {
      this.doneAnimation = false
      const s = el.style

      s.transitionDuration = '0s'
      s.opacity = '0'
      s.height = '0px'
      s.minWidth = 0
      s.overflow = 'hidden'
      s.padding = '0'
      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = '22px'
        s.padding = '0 8px'
        s.minWidth = '22px'
        s.opacity = '1'

        setTimeout(() => {
          s.overflow = 'visible'
          s.minWidth = 'auto'
          this.doneAnimation = true
          done()
        }, 225)
      })
    },
    leave(el, done) {
      const s = el.style
      s.transitionDuration = '.2s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.padding = '0'
      s.minWidth = '0px'
      s.opacity = '0'

      setTimeout(done, 155)
    },

    contentEnter(el, done) {

      const s = el.style

      const {width} = getComputedStyle(el)
      
      s.transitionDuration = 0
      s.width = 0
      s.marginLeft = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

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
        s.transitionDuration = '.2s'
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
  height: 22px;
  min-width: 22px;
  position: relative;
  display: inline-flex;
  padding: 0 8px;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
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
