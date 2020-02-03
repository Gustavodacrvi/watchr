<template>
  <div
    class="IconDrop"
    :class="{root, left: root}"
    :id='id'
    @click.stop
    @pointerup.stop
    @mouseup.stop
    @touchend.stop.passive
  >
    <transition name='fade-t'>
      <Icon v-if="handle && !hideHandle"
        class="cursor handle primary-hover"
        :icon="handle"
        :circle='circle'
        :title='title'
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
      <div v-if="opt && showing"
        class="icon-drop-content shadow cb rb"
        :class="{overflow: cardOptions && cardOptions.overflow}"
      >
        <transition name="fade" appear>
          <component v-if="showingCont"
            :is='getComp'
            :content='compContent'
            @close='closeIconDrop'
            @calc='calcStyles'
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
import RepeatPicker from './Calendar/Repeat/RepeatPicker.vue'
import TimePicker from './Calendar/TimePicker.vue'
import Confirm from './Confirm.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  props: ['options', 'id', 'circle', 'hideHandle', 'handle', 'handleColor', 'defaultShowing', 'root', 'width', 'title', 'center'],
  components: {
    Icon, ListIcons, CalendarPicker,
    TimePicker, RepeatPicker,
    Confirm,
  },
  data() {
    return {
      opt: this.options,
      showing: this.defaultShowing,
      justClosed: false,
      showingCont: this.defaultShowing,
      cardOptions: null,
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
        this.opt = this.options
        this.$store.commit('pushIconDrop', null)
      }, 200)
    },
    calcStyles() {
      const cont = this.$el.getElementsByClassName('icon-drop-content')[0]

      const s = cont.style

      s.transitionDuration = '0'
      requestAnimationFrame(() => {
        s.width = 'auto'
        s.height = 'auto'
        requestAnimationFrame(() => {
          const {height, width} = getComputedStyle(cont)
          s.width = width
          s.height = height
        })
      })
    },
    update(opt) {
      if (opt) {
        if (opt.cardOptions) this.cardOptions = opt.cardOptions
        
        const cont = this.$el.getElementsByClassName('icon-drop-content')[0]
        const comp = getComputedStyle(cont)
        const oldWidth = comp.width
        const oldHeight = comp.height

        const s = cont.style

        s.transitionDuration = '0s'
        setTimeout(() => {
          s.width = 'auto'
          s.height = 'auto'
          requestAnimationFrame(() => {
            const {height, width} = getComputedStyle(this.$el.getElementsByClassName('icon-drop-content')[0])
            s.width = oldWidth
            s.height = oldHeight
            setTimeout(() => {
              s.transitionDuration = '.2s'
              s.width = width
              s.height = height
            }, 125)
          })
        }, 275)
        this.showingCont = false
        setTimeout(() => {
          this.showingCont = true
        }, 200)
        this.opt = opt
      }
    },
    hide(evt) {
      let hide = true
      if (evt) {
        let found = false
        for (const node of evt.path)
          if (node.classList && (node.classList.contains('IconDrop') || node.classList.contains('MobileIcondrop'))) {
            found = true
            break
          }
        hide = !found
      }

      if (hide) {
        this.showing = false
        setTimeout(() => this.opt = this.options, 150)
      }
    },
    toggleIconDrop() {
      if (!this.center && this.isDesktop) {
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

      requestAnimationFrame(() => {
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
      return this.width ? this.width : ''
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
      if (this.showing) {
        window.addEventListener('click', this.hide)
      } else {
        window.removeEventListener('click', this.hide)
      }
    },
  },
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.icon-drop-content {
  position: absolute;
  right: 0;
  top: 0;
  width: 0;
  height: 0;
  padding: 18px 0;
  overflow: hidden;
  transition-duration: .15s;
  z-index: 5;
}

.overflow {
  overflow: visible;
}

.central {
  position: unset;
}

.root {
  z-index: 900;
}

.left .icon-drop-content {
  top: unset;
  left: 0;
  right: unset;
}

.right .icon-drop-content {
  bottom: 0;
  top: unset;
  right: 0;
}

.central .icon-drop-content {
  right: 50%;
  top: 50%;
  transform: translate(50%, -50%);
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transition-duration: .15s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition-duration: .15s;
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
