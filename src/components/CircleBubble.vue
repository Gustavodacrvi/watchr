<template>
  <div class="CircleBubble">
    <div class="wrapper">
      <transition
        @enter='enter'
      >
        <div v-if="showing"
          :style="{left, top,
            backgroundImage: `radial-gradient(${inner}, ${outer} 49%)`,
          }"
          class="circle"
        >
        </div>
      </transition>
    </div>
  </div>
</template>
<script>

export default {
  props: ['innerColor', 'outerColor', 'opacity'],
  data() {
    return {
      showing: false,
      left: 0,
      top: 0,
      doingTransition: false,
      el: null,

      inner: 'rgba(53, 73, 90, 0.6)',
      outer: 'var(--primary)',
      toDestroy: null,
    }
  },
  created() {
    if (this.innerColor)
      this.inner = this.innerColor
    if (this.outerColor)
      this.outer = this.outerColor
  },
  mounted() {
    this.getEl()

    const onClick = this.click
    const onTouch = this.touchStart

    const click = evt => onClick(evt)
    const touchstart = evt => onTouch(evt)
    
    const el = this.el
    
    el.addEventListener('click', click)
    el.addEventListener('touchstart', touchstart, {passive: true})

    this.toDestroy = () => {
      el.removeEventListener('click', click)
      el.removeEventListener('touchstart', touchstart)
    }
  },
  beforeDestroy() {
    this.toDestroy()
  },
  methods: {
    click(evt) {
      if (evt) {
        const rect = this.el.getBoundingClientRect()
  
        this.left = (evt.pageX - rect.left) + 'px'
        this.top = (evt.pageY - rect.top) + 'px'
        this.showing = true
      }
    },
    touchStart(e) {
      const rect = e.target.getBoundingClientRect()
      const scroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - scroll) + 'px'
        this.showing = true
      }
    },
    enter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 900
      let outerTrans = 600

      trans('0s')
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 200
      setTimeout(() => {
        trans(`.${innerTrans}s`)
        s.opacity = this.opacity ? this.opacity : 1
        s.width = width + 'px'
        s.height = width + 'px'
        setTimeout(() => {
          trans(`.${outerTrans}s`)
          s.width = width + 'px'
          s.height = width + 'px'
          s.opacity = 0
          setTimeout(() => {
            trans('0')
            s.width = 0
            s.height = 0
            this.showing = false
            this.doingTransition = false
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    getEl() {
      this.el = this.$el.parentElement
      return this.el
    }
  },
  watch: {
    innerColor() {
      this.inner = this.innerColor
    },
    outerColor() {
      this.outer = this.outerColor
    },
  }
}

</script>

<style scoped>

.CircleBubble {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.circle {
  position: absolute;
  transform: translate(-50%,-50%);
  border-radius: 1000px;
}

</style>
