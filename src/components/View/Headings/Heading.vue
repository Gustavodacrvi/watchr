<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
    :class="deviceLayout"
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper handle remove-highlight" key="wr"
          :class="{notRendering: !renderCont}"
        
          @click.stop="click"
          @touchstart.passive='touchStart'
          @touchmove.passive='touchmove'
          @touchend.passive='touchEnd'
          @dblclick="toggleEditing"
          
          @mouseenter="onHover = true"
          @mouseleave="onHover = false"
        >
          <div v-if="!dateType || !isValidMom" class="header">
            <span>
              <Icon v-if="hasProgress" class="icon"
                icon="tasks"
                :color='getHeadingColor'
                :progress="progress"
                width='10px'
              />
              <Icon v-else-if="icon" class="icon"
                :icon='icon'
                :color='getHeadingColor'
                width='13px'
              />
              <h3 class="name" :class="{hasIcon}" :style="{color: getHeadingColor}">{{ name }}</h3>
            </span>
            <template v-if="icons">
              <span v-for="i in icons" :key="i.name">
                <Icon
                  class="hover primary-hover cursor"
                  :color='i.color'
                  :hover='i.color'
                  :icon='i.icon'
                  :box='true'
                  boxColor='var(--sidebar-color)'
                  @click="openOptions(i.options)"
                />
              </span>
            </template>
          </div>
          <div v-else class="header">
            <div>
              <span class="big-name">{{ bigName }}</span>
              <span class="week-day">{{ weekDay }}</span>
            </div>
          </div>
        </div>
        <CalendarEvents v-if="calendarEvents" :date='calendarEvents'/>
        <NotesApp v-if="notes"
          :notes="notes"
          :heading='true'
          @save="saveNote"
        />
        <transition
          appear

          @beforeEnter='beforeEnter'
          @enter='enterCont'

          @leave='leaveCont'
        >
          <div v-if="renderCont" class="cont">
            <slot></slot>
          </div>
        </transition>
      </div>
      <div v-else class="input-wrapper" key="edig">
        <input
          class="input cbd"
          autocomplete="off"
          type="text"
          ref='input'
          :style="{color: getHeadingColor}"

          :value="edit"
          @input="v => edit = v.target.value"
          @keydown="keydown"
        >
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop/IconDrop.vue'
import EditVue from './../RenderComponents/Edit.vue'
import Notes from './Notes.vue'
import Defer from '@/mixins/defer'
import CalendarEvents from './../RenderComponents/CalendarEvents.vue'

import { mapGetters } from 'vuex'

import utils from '@/utils/'

import mom from 'moment'

const tod = mom()

export default {
  mixins: [
    Defer(),
  ],
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'length', 'dateType', 'calendarEvents', 'headingEditOptions', 'save', 'notes', 'progress', 'icon', 'nonFiltered', 'autoSchedule', 'icons'],
  components: {
    CalendarEvents,
    EditHeading: EditVue,
    NotesApp: Notes,
  },
  mounted() {
    this.bindOptions()
  },
  data() {
    return {
      edit: this.name,
      
      showing: true,
      onHover: false,
      editing: false,
      showCircle: false,
      isTouching: false,
      left: 0,
      top: 0,
      doingTransition: false,
      allowMobileOptions: false,
      timeout: null,
      startTime: 0,
      initialScroll: 0,
      fail: false,
    }
  },
  methods: {
    openOptions(opt) {
      this.$store.commit('pushIconDrop', opt)
    },
    keydown({key}) {
      if (key === "Enter")
        this.checkText()
      else if (key === "Escape")
        this.toggleEditing()
    },
    checkText() {
      const n = this.edit.trim()
      const opt = this.headingEditOptions
      if (n) {
        if (opt.excludeNames.includes(n)) {
          this.$store.commit('pushToast', {
            name: opt.errorToast,
            seconds: 3,
            type: 'error',
          })
        } else {
          this.toggleEditing()
          this.save(n)
        }
      }
    },
    
    stopEditing(evt) {
      let found
      const path = event.path || (event.composedPath && event.composedPath())
      for (const p of path)
        if (this.$refs.input === p) {
          found = true
          break
        }

      if (!found)
        this.toggleEditing()
    },
    
    beforeEnter(el) {
      if (!this.isDesktopBreakPoint)
        return;
      
      const s = el.style

      s.transitionDuration = 0
      s.opacity = 0
      s.height = 0
      s.overflow = 'visible'
    },
    enterCont(el, done) {
      if (!this.isDesktopBreakPoint)
        return done()

      const s = el.style
      
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.opacity = 1
        s.height = this.renderHeight
  
        setTimeout(() => {
          s.height = 'auto'
          done()
        }, 301)
      }, 50)
    },
    leaveCont(el, done) {
      if (!this.isDesktopBreakPoint)
        return done()

      const s = el.style

      s.transitionDuration = 0
      s.opacity = 1
      s.height = this.renderHeight
      s.overflow = 'hidden'

      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.opacity = 0
        s.height = '0px'
        s.overflow = 'hidden'
  
        setTimeout(done, 301)
      }, 100)
    },
    
    bindOptions() {
      if (this.isDesktopDevice) {
        const header = this.$el.getElementsByClassName('header-wrapper')[0]
        if (header)
          utils.bindOptionsToEventListener(header, this.options(this.nonFiltered, this.autoSchedule), this)
      }
    },
    openMobileOptions() {
      window.navigator.vibrate(20)
      this.$store.commit('pushIconDrop', this.options(this.nonFiltered, this.autoSchedule))
    },
    touchStart(e) {
      this.isTouching = true
      this.startTime = new Date()
      this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY
      const rect = e.target.getBoundingClientRect()
      this.initialScroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - this.initialScroll) + 'px'
        this.showCircle = true
      }

      this.timeout = setTimeout(() => {
        this.openMobileOptions()
      }, 350)
    },
    touchmove(evt) {
      const touch = evt.changedTouches[0]
      const move = Math.abs(document.scrollingElement.scrollTop - this.initialScroll) > 5 || Math.abs(touch.clientX - this.startX) > 5 || Math.abs(touch.clientY - this.startY) > 5
      if (move) {
        clearTimeout(this.timeout)
        this.fail = true
      }
    },
    click(evt) {
      if (this.isDesktopDevice && !this.doingTransition) {
        this.showing = !this.showing
        this.left = evt.offsetX + 'px'
        this.top = evt.offsetY + 'px'
        this.showCircle = true
      }
    },
    touchEnd(e) {
      clearTimeout(this.timeout)
      const time = new Date() - this.startTime
      
      this.isTouching = false
      if (!this.fail && (time < 250))
        this.showing = !this.showing
      this.fail = false
      this.allowMobileOptions = false
    },
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
            setTimeout(() => {
              this.doingTransition = false
            }, 50)
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    toggleEditing() {
      if (this.allowEdit)
        this.editing = !this.editing
      
      if (this.editing)
        setTimeout(() => this.$refs.input.focus(), 250)
    },
    saveNote(notes) {
      this.$emit('save-notes', notes)
    },
  },
  computed: {
    ...mapGetters(['isDesktopBreakPoint', 'isDesktopDevice', 'deviceLayout']),
    bigName() {
      const m = this.getMom

      if (m.isSame(tod, 'month'))
        return m.format('D')
      if (m.isSame(tod, 'year'))
        return m.format('MMM D')
      return m.format('MMM D Y')
    },
    weekDay() {
      return this.getMom.format('dddd')
    },
    getMom() {
      return mom(this.name, 'Y-M-D')
    },
    isValidMom() {
      return this.getMom.isValid()
    },
    renderHeight() {
      return ((this.length * this.itemHeight) - 4) + 'px'
    },
    itemHeight() {
      return this.isDesktopDevice ? 28 : 50
    },
    renderCont() {
      return this.defer(2) && this.showing
    },
    hasProgress() {
      return this.progress !== null && this.progress !== undefined
    },
    hasIcon() {
      return this.hasProgress || this.icon
    },
    getHeadingColor() {
      return this.color ? this.color : 'var(--primary)'
    },
  },
  watch: {
    nonFiltered() {
      this.bindOptions()
    },
    options() {
      this.bindOptions()
    },
    autoSchedule() {
      this.bindOptions()
    },
    name() {
      this.edit = this.name
    },
    editing() {
      if (!this.editing) {
        window.removeEventListener('click', this.stopEditing)
        this.edit = this.name
        this.bindOptions()
      } else {
        window.addEventListener('click', this.stopEditing)
      }
    },
  }
}

</script>

<style scoped>

.icons {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.icon {
  margin-left: 8px;
}

.IconDrop {
  transform: translateY(5px);
}

.Heading {
  position: relative;
  z-index: 1;
}

.Heading + .Heading {
  margin-top: 65px;
}

.Heading:hover {
  z-index: 2;
}

.week-day {
  margin-left: 6px;
  font-size: 1.05em;
  color: var(--fade);
}

.big-name {
  font-size: 1.4em;
}

.header-wrapper {
  padding: 0 4px;
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  border-bottom: 1px solid var(--light-gray);
  height: 25px;
  opacity: 1;
  z-index: 50;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  transition: background-color .2s;
}

.header-wrapper:hover {
  background-color: var(--dark-light-gray);
}

.notRendering {
  margin-top: 0px;
}

.cont {
  position: relative;
  z-index: 49;
}

.icon {
  transform: translate(-5px, 3px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.name {
  display: inline-block;
  margin: 0;
  user-select: none;
  color: var(--primary);
}

.name.hasIcon {
  transform: translateX(8px);
}

.input-wrapper {
  height: 25px;
  display: flex;
  align-items: center;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background-color: var(--dark-light-gray);
  border-bottom: 1.5px solid var(--light-gray);
}

.input {
  font-size: 1.17em;
  outline: none;
  background-color: transparent;
  font-weight: bold;
  padding-left: 4px;
  padding-right: 28px;
  width: 100%;
}

.sortable-ghost {
  background-color: var(--sidebar-color);
  border-radius: 4px;
}

.sortable-ghost .header-wrapper {
  border-bottom: none !important;
}

.sortable-ghost .header {
  display: none;
}

</style>
