<template>
  <div class="DropInput">
    <span v-if="msg && showing" class="msg">{{ msg }}</span>
    <textarea class="input rb cbd" ref='input'
      :placeholder='placeholder'
      rows='1'
      type='text'
      autocomplete='off'
      :value='str'
      @input='v => str = v.target.value'
      @blur="blur"
      @focus="onFocus"
      @keydown="keydown"
      @paste='onpaste'
      @keyup="keyup"

      @drop.prevent.stop='drop'
      @drag.stop.prevent
      @dragend.stop.prevent
      @dragstart.stop.prevent
      @dragenter.stop.prevent
      @dragleave.stop.prevent
      @dragover.stop.prevent
      
      :style="{backgroundColor: backColor || ''}"
    ></textarea>
    <transition
      @enter="enter"
      @leave="leave"
    >
      <div v-if="showing" class="content scroll-thin shadow rb">
        <transition-group
          @enter='enterItems'
          @leave='leaveItems'
        >
          <span v-for="o in options" :key="o"
            class="link"
            :class="{active: o === active}"
            @click="$emit('select', o)"
          >{{ o }}</span>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script>

export default {
  props: ['options', 'focus', 'value', 'placeholder', 'focusToggle', 'back-color', 'disableAutoSelect', 'enterOnShift', 'msg', 'onPaste',
  'onDrop'],
  data() {
    return {
      str: this.value,
      showing: false,
      active: '',
      shift: false,
    }
  },
  created() {
    if (!this.disableAutoSelect && this.options)
      this.active = this.options[0]
  },
  mounted() {
    if (this.focus)
      this.focusInput(200)
    this.fixHeight()
  },
  methods: {
    onpaste(...args) {
      if (this.onPaste)
        this.onPaste(args[0].clipboardData.getData('text/plain'), ...args)
    },
    drop(...args) {
      if (this.onDrop)
        this.onDrop(args[0].dataTransfer.files, ...args)
    },
    focusInput(timeout) {
      const el = this.$refs.input
      if (el)
        setTimeout(() => el.focus(), timeout)
    },
    fixHeight(height) {
      const el = this.$refs.input
      if (el) {
        const newHeight = (height || el.scrollHeight)
        if (newHeight)
          el.style.height = (height || el.scrollHeight) + 'px'
        else el.style.height = '18px'
      }
    },
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      requestAnimationFrame(() => {
        el.style.opacity = 1
        el.style.height = '25px'
        setTimeout(() => done(), 300)
      })
    },
    leaveItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 300)
    },
    onFocus() {
      this.showing = true
      if (!this.disableAutoSelect && this.options)
        this.active = this.options[0]
      else this.active = ''
    },
    blur() {
      this.showing = false
      this.active = ''
    },
    removeFocus() {
      this.$refs.input.blur()
    },
    enter(el, done) {
      let height = el.offsetHeight
      el.style.height = '0px'
      el.style.transitionDuration = '.4s'
      this.hideLinks()
      requestAnimationFrame(() => {
        el.style.height = height + 'px'
        requestAnimationFrame(() => {
          done()
          el.style.height = 'auto'
          setTimeout(() => {
            this.showLinks()
          })
        }, 300)
      })
    },
    leave(el, done) {
      el.style.height = '0px'
      this.hideLinks()
      setTimeout(() => done(), 300)
    },
    hideLinks() {
      const links = this.$el.getElementsByClassName('link')
      for (const l of links) {
        l.style.opacity = 0
        setTimeout(() => {
          l.style.transitionDuration = '.15s'
        })
      }
    },
    showLinks() {
      const links = this.$el.getElementsByClassName('link')
      for (const l of links) {
        l.style.opacity = 1
      }
    },
    keyup({key}) {
      if (key === 'Shift') this.shift = false
    },
    keydown(event) {
      const { key } = event
      if (this.shift) {
        if (key === 'ArrowLeft') this.$emit('goup')
        if (key === 'ArrowRight') this.$emit('godown')
      } else this.$emit('keydown', event)
      if (key === "Escape")
        this.$emit('cancel')
      else if (key === 'ArrowDown' || key === 'ArrowUp')
        this.moveActive(key)
      else if (key === 'Shift') this.shift = true
      else if (key === 'Enter') {
        if (!this.enterOnShift) {
          if (this.active) {
            this.$emit('select', this.active)
            this.active = ''
            event.preventDefault()
          } else {
            this.$emit('enter')
            setTimeout(() => {
              this.fixHeight() 
            })
            event.preventDefault()
          }
        } else if (this.shift) {
          this.$emit('enter')
          setTimeout(() => {
            this.fixHeight() 
          })
          event.preventDefault()
        }
      } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      this.active = ''
    }
    },
    getRefsPositions(text) {
      const drop = this.$el.getElementsByClassName('content')[0]
      const childNodes = drop.childNodes[0].childNodes
      let active
      for (const c of childNodes) {
        if (c.textContent === text) active = c
      }
      const activeHeight = active.clientHeight
      const activeTop = active.offsetTop
      const dropHeight = drop.clientHeight
      const scroll = drop.scrollTop

      return {
        act: {
          height: activeHeight,
          top: activeTop,
        },
        drop: {
          height: dropHeight,
          scroll,
        },
      }
    },
    moveActive(key) {
      if (!this.options)
        return;
      if (!this.active)
        this.active = this.options[0]
      else {
        const i = this.options.findIndex(el => {
          return el === this.active
        })
        const drop = this.$el.getElementsByClassName('content')[0]

        if (key === 'ArrowDown' && i + 1 < this.options.length) {
          this.active = this.options[i + 1]
          const p = this.getRefsPositions(this.active)

          if (p.act.top + p.act.height > p.drop.height + p.drop.scroll)
            drop.scrollTop += p.act.height
        } else if (key === 'ArrowUp' && i !== 0) {
          this.active = this.options[i - 1]
          const p = this.getRefsPositions(this.active)

          if (p.act.top < p.drop.scroll)
            drop.scrollTop -= p.act.height
        } else if (i + 1 !== this.options.length)
          this.active = ''
      }
    }
  },
  watch: {
    focusToggle() {
      this.focusInput(0)
    },
    str() {
      this.fixHeight()
      this.$emit('input', this.str)
    },
    value() {
      this.str = this.value
    },
  }
}

</script>

<style scoped>

.DropInput {
  position: relative;
}

.msg {
  position: absolute;
  right: 12px;
  bottom: 0;
  opacity: .4;
  font-size: .7em;
}


.input {
  border: none;
  padding: 9px;
  outline: none;
  border-radius: 4px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  overflow: hidden;
}

.no-padding .input {
  padding: 0;
  margin-left: -2px;
  padding-left: 2px;
}

.content {
  position: absolute;
  width: 100%;
  z-index: 5;
  top: 30px;
  overflow: auto;
  max-height: 200px;
  background-color: var(--light-gray);
}

.link {
  height: 25px;
  padding: 0 9px;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: background-color .3s, opacity .3s, height .3s;
  cursor: pointer;
}

.link.active, .link:hover {
  background-color: var(--extra-light-gray);
}

.no-back .cbd {
  background-color: transparent !important;
}

</style>
