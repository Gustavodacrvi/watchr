<template>
  <div class="CircleBubble">
    <div class="wrapper">
      <transition
        @enter='enter'
      >
        <div v-if="showing"
          :style="{left, top, backgroundImage: `radial-gradient(${inner} 0%, ${outer})`}"
          class="circle"
        >
        </div>
      </transition>
    </div>
  </div>
</template>
<script>

export default {
  props: ['innerColor', 'outerColor'],
  data() {
    return {
      showing: false,
      left: 0,
      top: 0,
      doingTransition: false,
      el: null,

      inner: 'rgba(53, 73, 90, 0.6)',
      outer: 'var(--primary)',
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
    this.el.addEventListener('click', evt => this.click(evt))
    this.el.addEventListener('touchstart', evt => this.touchStart(evt), {passive: true})
    this.el.addEventListener('touchend', evt => this.touchEnd(evt), {passive: true})
  },
  beforeDestroy() {
    this.el.removeEventListener('click', this.click)
    this.el.removeEventListener('touchstart', this.touchStart)
    this.el.removeEventListener('touchend', this.touchEnd)
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
      /* this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY */
      const rect = e.target.getBoundingClientRect()
      const scroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - scroll) + 'px'
        this.showing = true
      }
    },
    touchEnd(e) {
      this.isTouching = false
      const touch = e.changedTouches[0]
      const movedFingerX = Math.abs(touch.clientX - this.startX) > 10
      const movedFingerY = Math.abs(touch.clientY - this.startY) > 10
      if (!movedFingerX && !movedFingerY) {
        if (this.allowMobileOptions)
          this.openMobileOptions()
        else this.click()
      }
      this.allowMobileOptions = false
    },
    enter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 900
      let outerTrans = 600
      if (this.isTouching) {
        innerTrans += 500
        outerTrans += 500
      }

      trans('0s')
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 200
      setTimeout(() => {
        trans(`.${innerTrans}s`)
        s.opacity = 1
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
  }
}

</script>

<style scoped>

.CircleBubble {
  position: absolute;
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
