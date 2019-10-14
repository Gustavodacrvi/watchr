<template>
  <div class="DropInput">
    <textarea class="input rb cbd"
      :placeholder='placeholder'
      rows='1'
      type='text'
      autocomplete='off'
      v-model.trim='str'
      @blur="blur"
      @focus="onFocus"
      @keydown="keydown"
      @keyup="keyup"
    ></textarea>
    <transition
      @enter="enter"
      @leave="leave"
    >
      <div v-if="showing" class="content scroll-thin shadow cb rb">
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
  props: ['options', 'focus', 'value', 'placeholder'],
  data() {
    return {
      str: this.value,
      showing: false,
      active: this.options[0],
      control: false,
    }
  },
  created() {
    this.active = this.options[0]
  },
  mounted() {
    if (this.focus) {
      const el = this.$el.getElementsByClassName('input')[0]
      setTimeout(() => el.focus(), 200)
    }
  },
  methods: {
    fixHeight() {
      const el = this.$el.getElementsByClassName('input')[0]
      el.style.height = '5px'
      el.style.height = (el.scrollHeight) + 'px'
    },
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '40px'
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
      this.active = this.options[0]
    },
    blur() {
      this.showing = false
      this.active = ''
    },
    enter(el, done) {
      let height = el.offsetHeight
      el.style.height = '0px'
      el.style.transitionDuration = '.4s'
      this.hideLinks()
      setTimeout(() => {
        el.style.height = height + 'px'
        setTimeout(() => {
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
          l.style.transitionDuration = '.3s'
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
      if (key === 'Control') this.control = false
    },
    keydown(event) {
      const { key } = event
      console.log(key)
      if (key === "Escape")
        this.$emit('cancel')
      else if (key === 'ArrowDown' || key === 'ArrowUp')
        this.moveActive(key)
      else if (key === 'Control') this.control = true
      else if (key === 'Enter') {
        if (this.active) {
          this.$emit('select', this.active)
          this.active = ''
        } else {
          this.$emit('enter')
          setTimeout(() => {
            this.fixHeight() 
          })
        }
        event.preventDefault()
      } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      this.active = ''
      if (this.control) {
        if (key === 'ArrowLeft') this.$emit('goup')
        if (key === 'ArrowRight') this.$emit('godown')
      }
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

.input {
  border: none;
  padding: 12px;
  outline: none;
  border-radius: 10px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
  resize: none;
  overflow: hidden;
}

.content {
  position: absolute;
  width: 100%;
  z-index: 5;
  top: 43px;
  overflow: auto;
  max-height: 200px;
}

.link {
  display: block;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: background-color .3s, opacity .3s, height .3s;
  cursor: pointer;
}

.link.active, .link:hover {
  background-color: var(--light-gray);
}

</style>
