<template>
  <div class="IconDrop" :class="centralize ? 'central' : ''" @click.stop>
    <transition name='handle-t'>
      <Icon v-if="handle && !hideHandle" class="cursor handle" :icon="handle" :primaryHover='true' @click="toggleIconDrop" :color="handleColor" :width="getHandleWidth"/>
    </transition>
    <transition name="drop-trans"
      @beforeEnter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-if="showing && !showCalendar" key="links" class="content shadow cb rb">
        <transition name="links-trans">
          <div v-if="showingLinks" class="links">
            <div v-if="showSearch" class="search">
              <input class="input"
                v-model="search"
              >
            </div>
            <transition-group
              @enter='enterItems'
              @leave='leaveItems'
            >
              <template v-for="l in getLinks">
                <div v-if="!l.type" class="link cursor hide-trans"
                  :class="{important: l.important}"
                  :key="l.name"
                  :ref="l.name"
                  @click="l.important ? blink(l.name) : linkCallback(l.callback, l)"
                  @dblclick="l.important ? linkCallback(l.callback, l) : () => {}"
                >
                  <div class="link-cont">
                    <Icon v-if="l.icon"
                      class="cursor icon"
                      :icon="l.icon"
                      :color="l.color"
                    />
                    <span class="name">{{ priorityParser(l.name) }}</span>
                  </div>
                </div>
                <div v-else :key="l.name" class="header-link hide-trans">
                  <div class="header-name">{{ l.name }}</div>
                  <div class="values">
                    <Icon v-for="l in l.options" :key="l.id" class="val icon cursor"
                      width="25px"
                      :icon="l.icon"
                      :color="l.color"
                      :primaryHover="true"
                      @click="linkCallback(l.callback, l)"
                    />
                  </div>
                </div>
              </template>
            </transition-group>
          </div>
        </transition>
      </div>
      <div v-else-if="showing && showCalendar" class="content calendar shadow cb rb" key="calendar">
        <CalendarPicker @select="selectDate"/>
      </div>
    </transition>
  </div>
</template>

<script>

import IconVue from './Icon.vue'
import CalendarPickerVue from './View/Tasks/CalendarPicker.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['options', 'handle', 'handleColor', 'handleWidth', 'allowSearch', 'calendar', 'isMobileIconDropComp', 'centralize', 'calendarCall', 'hideHandle', 'value'],
  components: {
    Icon: IconVue,
    CalendarPicker: CalendarPickerVue,
  },
  data() {
    return {
      showing: this.value,
      showingLinks: true,
      opt: this.options,
      showCalendar: this.calendar,
      height: 0,
      calendarCallback: this.calendarCall,
      justClosed: false,
      width: 0,
      showSearch: this.allowSearch,
      search: '',
    }
  },
  mounted() {
    if (!this.isDesktop && this.isMobileIconDropComp) this.showing = true
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    toggleIconDrop() {
      if (this.isDesktop)
        this.showing = true
      else this.$store.commit('pushIconDrop', {
        options: this.options,
        allowSearch: this.allowSearch,
        calendar: this.calendar,
        calendarCallback: (date) => {
          if (this.calendarCallback) this.calendarCallback(date)
        },
      })
    },
    closeMobileIconDrop() {
      setTimeout(() => {
        this.$store.commit('pushIconDrop', null)
      }, 200)
    },
    blink(ref) {
      const el = this.$refs[ref][0]
      if (el) {
        el.classList.add('blink')
        setTimeout(() => el.classList.remove('blink'), 200)
      }
    },
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '35px'
        setTimeout(() => done(), 200)
      })
    },
    leaveItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 200)
    },
    linkCallback(callback, link) {
      const close = () => {
        this.showing = false
        this.justClosed = true
        this.$store.commit('clearSelected')
        this.closeMobileIconDrop()
      }
      if (callback) {
        let opt = callback(link, this)
        const isAPromise = opt && opt.then !== undefined

        if (!isAPromise && opt) {
          if (opt.calendar && opt.callback) {
            this.showCalendar = true
            this.calendarCallback = opt.callback
          } else if (opt.search) this.showSearch = true
          const cont = this.getContent()
          if (cont) {
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
            }, 200)
    
            this.toggleLinks()
            this.opt = opt
          }
        } else close()
      }
    },
    selectDate(date) {
      if (this.calendarCallback)
        this.calendarCallback(date)
      this.showing = false
      this.$store.commit('clearSelected')
    },
    toggleLinks() {
      this.showingLinks = false
      setTimeout(() => {
        this.showingLinks = true
      }, 200)
    },
    getContent() {
      return this.$el.getElementsByClassName('content')[0]
    },
    hide() {
      this.showing = false
      setTimeout(() => {
        this.opt = this.options
        this.showSearch = this.allowSearch
        this.showCalendar = this.calendar
      }, 200)
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
    beforeEnter(el) {
      el.style.width = 'auto'
      el.style.height = 'auto'
    },
    priorityParser(name) {
      const str = this.l[name]
      if (str) return str
      return name
    },
  },
  computed: {
    ...mapGetters(['isDesktop', 'l']),
    getHandleWidth() {
      return this.handleWidth ? this.handleWidth : ''
    },
    getLinks() {
      const links = this.opt.links || this.opt
      
      if (Array.isArray(links)) {
        if (this.showSearch && links)
          return links.filter(el => el.name.toLowerCase().includes(this.search.toLowerCase()))
        return links
      }
      return []
    }
  },
  watch: {
    options() {
      if (!this.calendar && !this.justClosed) {
        this.linkCallback(() => this.options, {})
        this.opt = this.options
      }
      this.justClosed = false
    },
    showing() {
      this.$emit('input', this.showing)
    }
  }
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.central {
  position: unset;
}

.header-link {
  margin: 8px 26px;  
  width: 160px;
  transition: opacity .2s;
}

.header-name {
  opacity: .6;
  font-size: .9em;
}

.values {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
}

.val {
  margin-right: 6px;
}

.handle {
  transition: color .2s;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.links {
  transition-duration: .2s;
  opacity: 1;
}

.search {
  margin: 0 12px;
  margin-bottom: 18px;
  min-width: 250px;
  position: relative;
}

.input {
  width: 100%;
  box-sizing: border-box;
  background: none;
  border: none;
  border-radius: 0;
  font-size: 1em;
  padding: 8px;
  outline: none;
  border-bottom: 1px solid var(--gray);
}

.links-trans-enter, .links-trans-leave-to {
  opacity: 0;
  transition-duration: .2s;
}

.links-trans-leave, .links-trans-enter-to {
  opacity: 1;
  transition-duration: .2s;
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

.central .content {
  right: 50%;
  top: 50%;
  transform: translate(50%, -50%);
}

.right .content {
  bottom: 0;
  top: unset;
  right: 0;
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

.link {
  display: flex;
  align-items: center;
  transition-duration: .2s;
  white-space: nowrap;
  height: 35px;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
}

.link.important {
  color: var(--red);
}

.link.important:hover {
  background-color: rgba(222, 89, 89, .1);
}

.blink {
  color: white !important;
  background-color: rgba(255,255,255,.1) !important;
}

.link .link-cont {
  display: flex;
  height: 100%;
  margin: 0 26px;
  align-items: center;
  justify-content: center;
}

.icon {
  position: relative;
  margin-right: 8px;
  bottom: -1.5px;
}

.handle-t-enter, .handle-t-leave-to {
  opacity: 0;
  transition: opacity .2s;
}

.handle-t-leave, .handle-t-enter-to {
  opacity: 1;
  transition: opacity .2s;
}

</style>
