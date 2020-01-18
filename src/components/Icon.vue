<template>
  <div class="Icon">
    <span v-if="getIcon || hasProgress"
      class="icon remove-highlight"
      :class="[{hideShadow: !shadow}, platform]"
      :style="{width: getWidth, color, filter: `drop-shadow(0 0 ${isDesktop ? 20 : 10}px ${color})`}"
      @click="iconClick"

      @mouseenter='iconEnter'
      @mouseleave="iconLeave"
    >
      <svg v-if="!hasProgress" :viewBox="getIcon.viewBox">
        <use :xlink:href="`#${getIcon.id}`"/>
      </svg>
      <div v-else-if="icon === 'pie-someday'" class="pie-wrapper" :style='outlineStyle'>
        <svg class="svg" viewBox="0 0 18.375 18.375">
          <circle fill="none" stroke="currentColor" stroke-width='1.5px' cx="50%" cy="50%" r="8.688" stroke-dasharray="2.7713,2.7713" />
          <circle class="pie" :stroke-dasharray="`${getProgress} 100`" fill="none" stroke="currentColor" stroke-width='6' cx="50%" cy="50%" r="3"/>
        </svg>
      </div>
      <div v-else class="pie-wrapper" :style='outlineStyle'>
        <svg class="svg" viewBox="0 0 18.375 18.375">
          <circle fill="none" stroke="currentColor" stroke-width='1.5px' cx="50%" cy="50%" r="8.688" />
          <circle class="pie" :stroke-dasharray="`${getProgress} 100`" fill="none" stroke="currentColor" stroke-width='6' cx="50%" cy="50%" r="3"/>
        </svg>
      </div>
      <input v-show="false"
        ref='file'
        type='file'
        @click.stop
        @change='handleFile'
      >
      <transition
        @enter='enter'
      >
        <div v-if="circle && activate" class="circle-wrapper"
          :style="{transform: `translate(-${offset/2}px, -${offset/2}px)`, width: this.circleWidth + 'px', height: this.circleWidth + 'px'}">
          <div class="circle"></div>
        </div>
      </transition>
    </span>
    <transition name="title-trans">
      <div v-if="showingTitle && title && isDesktop"
        class="icon-title rb"
      >
        {{ title }}
      </div>
    </transition>
  </div>
</template>

<script>

import inbox from '@/assets/icons/inbox.svg'
import calendar from '@/assets/icons/calendar.svg'
import sun from '@/assets/icons/sun.svg'
import star from '@/assets/icons/star.svg'
import user from '@/assets/icons/user.svg'
import userPlus from '@/assets/icons/user-plus.svg'
import out from '@/assets/icons/out.svg'
import arrow from '@/assets/icons/arrow.svg'
import settingsH from '@/assets/icons/settings-h.svg'
import settingsV from '@/assets/icons/settings-v.svg'
import sort from '@/assets/icons/sort.svg'
import tag from '@/assets/icons/tag.svg'
import sortName from '@/assets/icons/sort-name.svg'
import priority from '@/assets/icons/priority.svg'
import menu from '@/assets/icons/menu.svg'
import tasks from '@/assets/icons/tasks.svg'
import pen from '@/assets/icons/pen.svg'
import trash from '@/assets/icons/trash.svg'
import fire from '@/assets/icons/fire.svg'
import tinyCircle from '@/assets/icons/tiny-circle.svg'
import bloqued from '@/assets/icons/bloqued.svg'
import arrowTiny from '@/assets/icons/arrow-tiny.svg'
import circle from '@/assets/icons/circle.svg'
import copy from '@/assets/icons/copy.svg'
import plus from '@/assets/icons/plus.svg'
import circleCheck from '@/assets/icons/circle-check.svg'
import globe from '@/assets/icons/globe.svg'
import heading from '@/assets/icons/heading.svg'
import envelope from '@/assets/icons/envelope.svg'
import search from '@/assets/icons/search.svg'
import note from '@/assets/icons/note.svg'
import archive from '@/assets/icons/archive.svg'
import importIcon from '@/assets/icons/import.svg'
import exportIcon from '@/assets/icons/export.svg'
import users from '@/assets/icons/users.svg'
import close from '@/assets/icons/close.svg'
import heart from '@/assets/icons/heart.svg'
import sleep from '@/assets/icons/sleep.svg'
import deadline from '@/assets/icons/deadline.svg'
import repeat from '@/assets/icons/repeat.svg'
import box from '@/assets/icons/box.svg'
import boxDash from '@/assets/icons/box-dash.svg'
import file from '@/assets/icons/file.svg'
import folder from '@/assets/icons/folder.svg'
import filter from '@/assets/icons/filter.svg'
import magic from '@/assets/icons/magic.svg'
import clock from '@/assets/icons/clock.svg'
import pomo from '@/assets/icons/pomo.svg'
import pie from '@/assets/icons/pie.svg'
import check from '@/assets/icons/check.svg'
import layerGroup from '@/assets/icons/layer-group.svg'
import boxCheck from '@/assets/icons/box-check.svg'
import calendarStar from '@/assets/icons/calendar-star.svg'
import circleFilled from '@/assets/icons/circle-filled.svg'
import circleDash from '@/assets/icons/circle-dash.svg'
import circleCheckDash from '@/assets/icons/circle-check-dash.svg'
import boxCheckDash from '@/assets/icons/box-check-dash.svg'

import { mapGetters } from 'vuex'

export default {
  props: ['icon', 'width', 'color', 'progress', 'svg', 'file', 'shadow', 'circle', 'stop', 'title'],
  data() {
    return {
      activate: false,
      showingTitle: false,
      timeoutTitle: null,
      icons: {
        inbox, calendar, sun, arrow, star, user, out,
        sort, tag, priority, menu, tasks, archive,
        pen, trash, fire, bloqued, circle, users,
        copy, plus, globe, heading, search, note,
        envelope, deadline, sleep, repeat, box, file,
        folder, heart, close, filter, magic, clock,
        pomo, pie, check,
        "box-dash": boxDash,
        "circle-dash": circleDash,
        "circle-check-dash": circleCheckDash,
        "layer-group": layerGroup,
        "circle-filled": circleFilled,
        "box-check-dash": boxCheckDash,
        "box-check": boxCheck,
        "calendar-star": calendarStar,
        "import": importIcon,
        "export": exportIcon,
        "user-plus": userPlus,
        "circle-check": circleCheck,
        "settings-h": settingsH,
        "sort-name": sortName,
        "settings-v": settingsV,
        "tiny-arrow": arrowTiny,
        "tiny-circle": tinyCircle,
      },
    }
  },
  methods: {
    iconEnter() {
      this.timeoutTitle = setTimeout(() => this.showingTitle = true, 500)
    },
    iconLeave() {
      clearTimeout(this.timeoutTitle)
      this.showingTitle = false
    },
    iconClick(evt) {
      if (this.stop)
        evt.stopPropagation()
      
      this.$emit('click')
      if (this.file && this.fileInput)
        this.fileInput.click()
      if (this.circle) {
        this.activate = true
      }
    },
    handleFile() {
      const inp = this.fileInput
      if (inp.files[0])
        this.$emit('add', inp.files[0])
      inp.value = ''
    },
    enter(cir) {
      const wrapperS = cir.style
      const s = cir.childNodes[0].style

      s.transitionDuration = '0'
      s.opacity = 0
      s.width = 0
      s.height = 0
      const width = this.circleWidth
      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.opacity = 1
        s.width = width + 'px'
        s.height = width + 'px'
        requestAnimationFrame(() => {
          s.transitionDuration = '.35s'
          s.width = width + 'px'
          s.height = width + 'px'
          s.opacity = 0
          requestAnimationFrame(() => {
            s.transitionDuration = '0'
            s.width = 0
            s.height = 0
            this.activate = 0
          }, 350)
        }, 150)
      })
    },
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
    getProgress() {
      return 19 * this.progress / 100
    },
    circleWidth() {
      return this.getRawWidth + this.offset
    },
    offset() {
      return 25
    },
    getIcon() {
      return this.icons[this.icon]
    },
    fileInput() {
      return this.$refs['file']
    },
    getRawWidth() {
      const defaultWidth = this.hasProgress ? 17 : 20
      return this.width ? parseInt(this.width, 10) : defaultWidth
    },
    getWidth() {
      const defaultWidth = this.getRawWidth + 'px'
      return this.width ? this.width : defaultWidth
    },
    hasProgress() {
      return this.progress !== undefined && this.progress !== null
    },
    outlineStyle() {
      const width = '' + (parseInt(this.getWidth, 10) + 7) + 'px'
      return {
        width,
        height: width,
      }
    }
  },
}

</script>

<style scoped>

.Icon {
  position: relative;
  display: inline-block;
}

.icon-title {
  position: absolute;
  top: 135%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 12px;
  font-size: .9em;
  background-color: var(--appnav-color);
  cursor: initial;
}

.icon-title::before {
  position: absolute;
  left: 50%;
  top: -10px;
  transform: translateX(-50%);
  content: '';
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid var(--appnav-color);
}

.icon {
  display: inline-block;
  position: relative;
}

.circle-wrapper {
  left: 0;
  top: 0;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle {
  border-radius: 100px;
  background-image: radial-gradient(rgba(0,0,0,0), var(--gray));
}

.primary-hover .icon:hover {
  transition-duration: .15s;
  color: var(--primary) !important;
}

.circle-enter, .circle-enter-to {
  transition-duration: .15s;
}

.hideShadow {
  filter: none !important
}

.icon:active {
  color: var(--light-gray) !important;
}

.svg {
  left: -3px;
  top: -3px;
  border-radius: 50%;
  position: relative;
}

.pie-wrapper {
  position: relative;
  transform: translateY(4px);
  display: inline-block;
  stroke: var(--white);
}

.pie {
  transition: color 0s, stroke-dasharray .7s;
  transform: rotate(-90deg);
  transform-origin: 50%;
}

.light {
  stroke: var(--white);
}

.title-trans-enter, .title-trans-leave-to {
  opacity: 0;
  transform: translate(-50%, 25px);
  transition-duration: .25s;
}

.title-trans-leave, .title-trans-enter-to {
  opacity: 1;
  transform: translate(-50%, 0px);
  transition-duration: .25s;
}

</style>
