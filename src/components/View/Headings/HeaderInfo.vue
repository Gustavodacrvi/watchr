<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="header-info rb"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click.stop
    >
      <Icon class="icon faded" :icon="icon" :title='title'/>
      <span v-show="content || right">
        <transition
          @enter='contentEnter'
          @leave='contentLeave'
        >
          <span class="cont" v-if="content">{{ content }}</span>
        </transition>
        <transition
          @enter='contentEnter'
          @leave='contentLeave'
        >
          <span v-if="right" class="faded cont">{{ right }}</span>
        </transition>
      </span>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

import utils from '@/utils'

export default {
  props: ['content', 'right', 'icon', 'options', 'title'],
  components: {
    Icon,
  },
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

    enter(el, done) {
      const s = el.style

      s.transitionDuration = '0s'
      s.opacity = '0'
      s.height = '0px'
      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.height = '35px'
        s.opacity = '1'

        setTimeout(done, 255)
      })
    },
    leave(el, done) {
      const s = el.style
      s.transitionDuration = '.15s'
      if (this.editingNote)
        s.transitionDuration = '0s'
      s.height = '0px'
      s.opacity = '0'

      setTimeout(done, 255)
    },

    contentEnter(el, done) {

      const s = el.style

      const {width} = getComputedStyle(el)
      
      s.transitionDuration = 0
      s.width = 0
      s.marginLeft = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'

        s.width = width
        s.marginLeft = '6px'

        setTimeout(done, 305)
      })

    },
    contentLeave(el, done) {
      const s = el.style
      
      s.transitionDuration = '.3s'

      s.width = 0
      s.marginLeft = 0

      setTimeout(done, 305)
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
}

.header-info {
  height: 35px;
  display: inline-flex;
  padding: 0 8px;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
}

.cont {
  margin-left: 6px;
}

.icon {
  transform: translateY(2px);
}

.header-info:hover {
  background-color: var(--light-gray);
}

.header-info:active {
  transform: scale(.9,.9);
}

</style>
