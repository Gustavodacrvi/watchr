<template>
  <div
    class="IconDrop"
    :id='id'
    @click.stop
    @pointerup.stop
    @mouseup.stop
    @touchend.stop
  >
    <transition name='handle-t'>
      <Icon v-if="handle && !hideHandle"
        class="cursor handle"
        :icon="handle"
        :primaryHover='true'
        :color="handleColor"
        :width="getHandleWidth"
        @click="toggleIconDrop"
      />
    </transition>
    <transition
      @beforeEnter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <component v-if="opt && showing"
        class="content shadow cb rb"
        :is='getComp'
        :content='compContent'
      />
    </transition>
  </div>
</template>

<script>

import Icon from './../Icon.vue'

import ListIcons from './ListIcons.vue'
import CalendarPicker from './Calendar.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['options', 'id', 'hideHandle', 'handle', 'handleColor'],
  components: {
    Icon, ListIcons, CalendarPicker,
  },
  data() {
    return {
      opt: this.options,
      showing: false,
    }
  },
  mounted() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    hide() {
      this.showing = false
      setTimeout(() => this.opt = this.options, 200)
    },
    toggleIconDrop() {
      if (this.isDesktop)
        this.showing = !this.showing
      else this.$store.commit('pushIconDrop', this.options)
    },
    beforeEnter(el) {
      el.style.width = 'auto'
      el.style.height = 'auto'
    },
    leave(el) {
      el.style.width = 0
      el.style.height = 0
    },
    enter(el) {
      const { height, width } = getComputedStyle(el)
      
      el.style.width = 0
      el.style.height = 0

      setTimeout(() => {
        el.style.width = width
        el.style.height = height
      })
    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
    getComp() {
      if (this.opt && this.opt.comp) return this.opt.comp
      return 'ListIcons'
    },
    compContent() {
      if (this.opt) {
        if (this.opt.content) return this.opt.content
        return this.opt
      }
    },
    getHandleWidth() {
      return this.handleWidth ? this.handleWidth : ''
    },
  },
  watch: {
    options() {
      this.opt = this.options
    }
  },
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.content {
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 0;
  padding: 18px 0;
  overflow: hidden;
  transition-duration: .2s;
  z-index: 5;
}

</style>
