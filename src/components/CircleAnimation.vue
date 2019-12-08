<template>
  <div class='circle-trans-wrapper-wrapper'
    @touchstart='touchStart'
  >
    <div class="circle-trans-wrapper" @touchstart='touchStart'>
      <transition
        @enter='circleEnter'
      >
        <div v-if="showCircle" class="circle-trans-transition"
          :style="{left, top, backgroundImage: `radial-gradient(var(--light-gray), var(--gray))`}"
        ></div>
      </transition>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      showCircle: false,
      left: 0,
      top: 0,
      doingTransition: false,
    }
  },
  methods: {
    circleEnter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 450
      let outerTrans = 250
      if (this.isTouching) {
        innerTrans += 150
        outerTrans += 150
      }

      trans('0s')
      s.opacity = 0
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 100
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
            this.showCircle = false
            this.doingTransition = false
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    touchStart(e) {
      console.log('3Z')
      this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY
      const rect = e.target.getBoundingClientRect()
      const scroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - scroll) + 'px'
        console.log(this.left, this.top)
        this.showCircle = true
      }
    },
  }  
}

</script>
