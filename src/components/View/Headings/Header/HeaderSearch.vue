<template>
  <div
    class="HeaderSearch"

    @touchstart.passive='touchstart'
    @touchmove.prevent='touchmove'
    @touchend.passive='touchend'
  >
    <div
      class="search"
      ref="search"
    >
      <div class="search-icon-wrapper">
        <svg class="svg search-el" viewBox="0 0 12.375 12.375" width='35px' height='35px'>
          <circle ref='circle' class="pie" stroke-dasharray="0 100" fill="none" :stroke="circleStroke" stroke-width="6" cx="50%" cy="50%" r="3"/>
        </svg>
        <Icon class="cursor remove-highlight search-el"
          icon="search"
          width="16px"
          :color="searchColor"
          :circle="true"
        />
      </div>
    </div>
  </div>
</template>

<script>

import Icon from '../../../Icon.vue'

import utils from '@/utils'

const MAXIMUM_TOUCH_DISTANCE = 120

export default {
  components: {
    Icon,
  },
  data() {
    return {
      y: 0,

      search: {
        r: 179,
        g: 179,
        b: 179,
      },
      circle: {
        r: 41,
        g: 41,
        b: 41,
      },
      fireSearchFallback: false,
    }
  },
  methods: {
    touchstart(evt) {
      this.y = evt.touches[0].screenY
    },
    move(x, transition) {
      const achievedMax = x >= MAXIMUM_TOUCH_DISTANCE
      this.fireSearchFallback = achievedMax
      if (achievedMax) x = MAXIMUM_TOUCH_DISTANCE
      
      const s = this.$refs.search.style
      const cir = this.$refs.circle.style

      const transitionColor = (oldNum, newNum) => utils.transitionColor(oldNum, newNum, x, MAXIMUM_TOUCH_DISTANCE)
      const getOpacity = () =>  x / MAXIMUM_TOUCH_DISTANCE
      const getTransform = () => {
        const scale = 1 + (.6 * x / MAXIMUM_TOUCH_DISTANCE)
        return `translateY(${x}px) scale(${scale}, ${scale})`
      }
      const getStrokeDasharray = () => `${19 * x / MAXIMUM_TOUCH_DISTANCE} 100`

      const dur = transition ? '.4s' : '0s'

      s.transitionDuration = dur
      cir.transitionDuration = dur

      this.circle.r = transitionColor(41, 89)
      this.circle.g = transitionColor(41, 160)
      this.circle.b = transitionColor(41, 222)

      const newOffset = transitionColor(179, 28)
      this.search.r = newOffset
      this.search.g = newOffset
      this.search.b = newOffset

      cir.strokeDasharray = getStrokeDasharray()
      s.opacity = getOpacity()
      s.transform = getTransform()
    },
    touchmove(evt) {
      const diff = evt.touches[0].screenY - this.y

      this.move(diff)
    },
    touchend() {
      if (this.fireSearchFallback)
        this.openSearchBar()

      this.move(0, true)
    },
    openSearchBar() {
      this.$store.dispatch('pushPopup', {comp: 'FastSearch', naked: true})
    },
  },
  computed: {
    circleStroke() {
      const {r,g,b} = this.circle
      return `rgb(${r}, ${g}, ${b})`
    },
    searchColor() {
      const {r,g,b} = this.search
      return `rgb(${r}, ${g}, ${b})`
    },
  }
}

</script>

<style scoped>

.HeaderSearch {
  position: absolute;
  height: 100%;
  width: 100%;
}

.search {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 20px;
  position: absolute;
  top: -20px;
  opacity: 0;
  overflow: visible;
}

.search-icon-wrapper {
  transform: translateX(-5px);
  overflow: visible;
  position: relative;
}

.svg {
  transform: translate(-9px,-9px);
}

.search-el {
  position: absolute;
}

.pie {
  /* transition: color 0s, stroke-dasharray .7s; */
  transform: rotate(-90deg);
  transform-origin: 50%;
}

</style>
