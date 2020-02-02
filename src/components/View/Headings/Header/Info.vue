<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div v-if="headerInfo" class="Info">
      <HeaderInfo v-for="item in headerInfo"
        :key="item.icon"
        v-bind="item"
      />
    </div>
  </transition>
</template>

<script>

// calendar, files, tags

/* 
    <HeaderFiles v-if="defer(3) && files"
      :files='files'
    /> */

import HeaderInfo from './../HeaderInfo.vue'

export default {
  components: {
    HeaderInfo,
  },
  props: ['headerInfo'],
  methods: {
    enter(el, done) {
      const s = el.style

      const {height} = getComputedStyle(el)

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0
      s.margin = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'

        s.height = height
        s.opacity = 1
        s.margin = '6px 0'

        setTimeout(done, 255)
      })
      
    },
    leave(el, done) {
      
      const s = el.style

      s.transitionDuration = '.25s'

      s.height = 0
      s.opacity = 0
      s.margin = 0

      setTimeout(done, 255)

    },
  },
}

</script>

<style scoped>

.Info {
}

</style>
