<template>
  <div class="IconDrop" @click.stop>
    <Icon class="cursor handle" :icon="handle" :primaryHover='true' @click="showing = true" :color="handleColor" :width="getHandleWidth"/>
    <transition name="drop-trans"
      @beforeEnter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <div v-if="showing && !showCalendar" key="links" class="content shadow cb rb">
        <transition name="links-trans">
          <div v-if="showingLinks" class="links">
            <div v-if="allowSearch" class="search">
              <input class="input"
                v-model="search"
              >
            </div>
            <transition-group
              @enter='enterItems'
              @leave='leaveItems'
            >
              <template v-for="link in getLinks">
                <div v-if="!link.type" class="link hide-trans"
                  :key="link.name"
                  @click="linkCallback(link.callback, link)"
                >
                  <div class="link-cont">
                    <Icon v-if="link.icon"
                      class="cursor icon"
                      :icon="link.icon"
                      :color="link.color"
                    />
                    <span class="name">{{ link.name }}</span>
                  </div>
                </div>
                <div v-else :key="link.name" class="header-link hide-trans">
                  <div class="header-name">{{ link.name }}</div>
                  <div class="values">
                    <Icon v-for="l in link.options" :key="l.id" class="val icon cursor"
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

export default {
  props: ['options', 'handle', 'handleColor', 'handleWidth', 'allowSearch', 'calendar'],
  components: {
    Icon: IconVue,
    CalendarPicker: CalendarPickerVue,
  },
  data() {
    return {
      showing: false,
      showingLinks: true,
      links: this.options,
      showCalendar: this.calendar,
      height: 0,
      calendarCallback: null,
      width: 0,
      search: '',
    }
  },
  created() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    enterItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => {
        el.style.opacity = 1
        el.style.height = '35px'
        setTimeout(() => done(), 300)
      })
    },
    leaveItems(el, done) {
      el.style.opacity = 0
      el.style.height = '0px'
      setTimeout(() => done(), 300)
    },
    linkCallback(callback, link) {
      if (callback) {
        const links = callback(link)
        if (links.calendar && links.callback) {
          this.showCalendar = true
          this.calendarCallback = links.callback
        } else if (links) {
          const cont = this.getContent()
          
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
                cont.style.transitionDuration = '.3s'
                cont.style.width = width
                cont.style.height = height
                cont.style.transitionDelay = '.0s'
              }, 50)
            })
          }, 300)
  
          this.toggleLinks()
          this.links = links
        } else this.showing = false
      }
    },
    selectDate(date) {
      if (this.calendarCallback)
        this.calendarCallback(date)
      this.$emit('select', date)
      this.showing = false
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
        this.links = this.options
        this.showCalendar = false
      }, 100)
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
    }
  },
  computed: {
    getHandleWidth() {
      return this.handleWidth ? this.handleWidth : ''
    },
    getLinks() {
      if (this.allowSearch && this.links)
        return this.links.filter(el => el.name.toLowerCase().includes(this.search.toLowerCase()))
      return this.links
    }
  },
  watch: {
    options() {
      this.links = this.options
    }
  }
}

</script>

<style scoped>

.IconDrop {
  position: relative;
}

.header-link {
  margin: 8px 26px;  
  width: 160px;
  transition: opacity .3s;
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

.hidden {
  opacity: 0;
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
  transition-duration: .3s;
  z-index: 5;
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

.drop-trans-enter .link, .drop-trans-leave-to .hide-trans {
  opacity: 0 !important;
}

.drop-trans-leave .link, .drop-trans-enter-to .hide-trans {
  opacity: 1 !important;
}

.link {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition-duration: .3s;
  white-space: nowrap;
  height: 35px;
}

.link:hover {
  color: var(--primary);
  background-color: rgba(87,160,222,.1);
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

</style>
