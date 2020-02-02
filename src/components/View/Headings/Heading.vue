<template>
  <div class="Heading"
    :name='header.name'
    :id='header.id'
  >
    <transition name="fade" mode="out-in">
      <div v-if="!editing">
        <div class="header-wrapper handle cursor remove-highlight" key="wr"
          :class="{notRendering: !renderCont}"
        
          @click="click"
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
                width='15px'
              />
              <Icon v-else-if="icon" class="icon"
                :icon='icon'
                :color='getHeadingColor'
                width='22px'
              />
              <h3 class="name" :class="{hasIcon}" :style="{color: getHeadingColor}">{{ name }}</h3>
            </span>
          </div>
          <div v-else class="header">
            <div>
              <span class="big-name">{{ bigName }}</span>
              <span class="week-day">{{ weekDay }}</span>
            </div>
          </div>
        </div>
        <CalendarEvents v-if="calendarEvents" :date='calendarEvents'/>
        <NotesApp :notes="notes" @save-notes="saveNote"/>
        <transition
          @enter='enterCont'
          @leave='leaveCont'
        >
          <div v-if="renderCont" class="cont">
            <slot></slot>
          </div>
        </transition>
      </div>
      <div v-else key="edig">
        <EditHeading
          :name='name'
          placeholder='Heading name...'
          :errorToast='headingEditOptions.errorToast'
          :names='headingEditOptions.excludeNames'
          @save='save'
          @cancel='toggleEditing'
        />
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop/IconDrop.vue'
import IconVue from '../../Icon.vue'
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
  props: ['name', 'options', 'color', 'header', 'allowEdit', 'length', 'dateType', 'calendarEvents', 'headingEditOptions', 'save', 'notes', 'progress', 'icon'],
  components: {
    IconDrop: IconDropVue, CalendarEvents,
    Icon: IconVue,
    EditHeading: EditVue,
    NotesApp: Notes,
  },
  mounted() {
    this.bindOptions()
  },
  data() {
    return {
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
    enterCont(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.opacity = 0
      s.height = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.25s'
        s.opacity = 1
        s.height = this.renderHeight
        setTimeout(() => {
          s.height = 'auto'
          done()
        }, 255)
      })
    },
    leaveCont(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.opacity = 1
      s.height = this.renderHeight

      requestAnimationFrame(() => {
        s.transitionDuration = '.4s'
        s.opacity = 0
        s.height = 0
        setTimeout(done, 500)
      })

    },
    
    bindOptions() {
      if (this.isDesktop) {
        const header = this.$el.getElementsByClassName('header-wrapper')[0]
        if (header)
          utils.bindOptionsToEventListener(header, this.options, this)
      }
    },
    openMobileOptions() {
      window.navigator.vibrate(100)
      this.$store.commit('pushIconDrop', this.options)
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
      if (this.isDesktop && !this.doingTransition) {
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
    },
    saveNote(notes) {
      this.$emit('save-notes', notes)
    },
  },
  computed: {
    ...mapGetters(['isDesktop']),
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
      return ((this.length * this.itemHeight) + 4) + 'px'
    },
    itemHeight() {
      return this.isDesktop ? 38 : 50
    },
    renderCont() {
      return this.defer(2) && this.showing
    },
    showIconDrop() {
      const isDesktop = this.$store.getters.isDesktop
      if (isDesktop && this.onHover) return true
      else if (!isDesktop) return true
      return false
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
    options() {
      this.bindOptions()
    },
    editing() {
      if (!this.editing)
        this.bindOptions()
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
  margin-top: 50px;
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
  font-size: 1.6em;
}

.header-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin-bottom: 0px;
  border-bottom: 1.5px solid var(--light-gray);
  height: 50px;
  opacity: 1;
  z-index: 50;
}

.notRendering {
  margin-top: 0px;
}

.cont {
  position: relative;
  z-index: 49;
  overflow: hidden;
}

.icon {
  transform: translate(-5px, 3px);
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  display: inline-block;
  margin: 0;
  color: var(--primary);
}

.name.hasIcon {
  transform: translateX(8px);
}

</style>
