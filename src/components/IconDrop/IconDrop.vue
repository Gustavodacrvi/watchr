<template>
  <div
    class="IconDrop"
    :class="{root, left: root}"
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
    <transition name="drop-trans" appear
      @beforeEnter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-if="opt && showing" class="content shadow cb rb">
        <transition name="fade" appear>
          <component v-if="showingCont"
            :is='getComp'
            :content='compContent'
            @close='closeIconDrop'
            @update='update'
          />
        </transition>
      </div>
    </transition>
  </div>
</template>

<script>

import Icon from './../Icon.vue'

import ListIcons from './ListIcons.vue'
import CalendarPicker from './Calendar.vue'
import WeeklyPicker from './Calendar/WeeklyPicker.vue'
import PeriodicPicker from './Calendar/PeriodicPicker.vue'
import Profile from './Profile.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['options', 'id', 'hideHandle', 'handle', 'handleColor', 'defaultShowing', 'root'],
  components: {
    Icon, ListIcons, CalendarPicker, WeeklyPicker,
    PeriodicPicker, Profile,
  },
  data() {
    return {
      opt: this.options,
      showing: this.defaultShowing,
      justClosed: false,
      showingCont: this.defaultShowing,
    }
  },
  mounted() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    closeIconDrop() {
      this.showing = false
      this.showingCont = false
      setTimeout(() => {
        this.$store.commit('pushIconDrop', null)
      }, 200)
    },
    update(opt) {
      if (opt) {
        const cont = this.$el.getElementsByClassName('content')[0]
        const s = getComputedStyle(cont)
        const oldWidth = s.width
        const oldHeight = s.height
  
        cont.style.transitionDelay = '.05s'
        cont.style.transitionDuration = '0s'
        setTimeout(() => {
          cont.style.width = 'auto'
          cont.style.height = 'auto'
          setTimeout(() => {
            const {height, width} = getComputedStyle(cont)
            cont.style.width = oldWidth
            cont.style.height = oldHeight
            setTimeout(() => {
              cont.style.transitionDuration = '.2s'
              cont.style.width = width
              cont.style.height = height
              cont.style.transitionDelay = '.0s'
            }, 50)
          })
        }, 300)
        this.showingCont = false
        setTimeout(() => {
          this.showingCont = true
        }, 200)
        this.opt = opt
      }
    },
    hide() {
      this.showing = false
      setTimeout(() => this.opt = this.options, 200)
    },
    toggleIconDrop() {
      if (this.isDesktop) {
        this.showingCont = true
        this.showing = !this.showing
      }
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
      if (!this.justClosed)
        this.opt = this.options
      this.justClosed = false
    },
    showing() {
      this.$emit('handle-toggle', this.showing)
    },
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

.central {
  position: unset;
}

.root {
  z-index: 900;
}

.left .content {
  top: unset;
  left: 0;
  right: unset;
}

.right .content {
  bottom: 0;
  top: unset;
  right: 0;
}

.central .content {
  right: 50%;
  top: 50%;
  transform: translate(50%, -50%);
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transition-duration: .2s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition-duration: .2s;
}

.drop-trans-enter-active .hide-trans {
  transition-duration: .5s;
  transition-delay: .25s;
}

.drop-trans-leave-active .hide-trans {
  transition-duration: .1s;
}

.drop-trans-enter .hide-trans, .drop-trans-leave-to .hide-trans {
  opacity: 0 !important;
}

.drop-trans-leave .hide-trans, .drop-trans-enter-to .hide-trans {
  opacity: 1 !important;
}

</style>
