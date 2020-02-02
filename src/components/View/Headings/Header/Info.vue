<template>
  <div class="Info">
    <transition
      appear
      @enter='enter'
      @leave='leave'
      tag="div"
    >
      <div v-if="headerInfo && headerInfo.icons">
        <HeaderInfo v-for="item in headerInfo.icons"
          :key="item.icon"
          v-bind="item"
        />
      </div>
    </transition>
    <transition
      appear
      @enter='tagsEnter'
      @leave='tagsLeave'
    >
      <div v-if="headerInfo && headerInfo.tags && headerInfo.tags.names" key="tag"
        class="tags-wrapper"
      >
        <Tag v-for="n in headerInfo.tags.names" :key="n"
          icon='tag'
          color='var(--red)'
          :value="n"
          @click="headerInfo.tags.remove(n)"
        />
      </div>
    </transition>
  </div>
</template>

<script>

// calendar, files, tags

import HeaderInfo from './../HeaderInfo.vue'
import Tag from '../../Tag.vue'

export default {
  components: {
    HeaderInfo, Tag,
  },
  props: ['headerInfo'],
  methods: {
    enter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0
      s.margin = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'

        s.height = '35px'
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
    tagsEnter(el, done) {

      const s = el.style
      
      s.transitionDuration = 0
      s.height = 0
      s.margin = 0 
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'

        s.height = '22px'
        s.margin = '6px 0'
        s.opacity = 1

        setTimeout(done, 255)
      })

    },
    tagsLeave(el, done) {
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

.tags-wrapper {
  display: flex;
}

</style>
