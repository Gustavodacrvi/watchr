<template>
  <div v-if="getIcon"
    class="icon"
    :class="[{primaryHover}, platform]"
    :style="{width: getWidth, color}"
    @click="iconClick"
  >
    <svg v-if="!hasProgress" :viewBox="getIcon.viewBox">
      <use :xlink:href="`#${getIcon.id}`"/>
    </svg>
    <div v-else class="pie-wrapper" :style='outlineStyle'>
      <svg class='svg' viewBox="0 0 32 32" :width='getWidth'>
        <circle class='pie' :stroke-dasharray="`${progress} 100`" fill='currentColor' stroke='currentColor'></circle>
      </svg>
      <div class="outline" :style='outlineStyle' style='border: .5px currentColor solid'></div>
    </div>
    <input v-show="false"
      ref='file'
      type='file'
      @click.stop
      @change='handleFile'
    >
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
import sleep from '@/assets/icons/sleep.svg'
import deadline from '@/assets/icons/deadline.svg'
import repeat from '@/assets/icons/repeat.svg'
import box from '@/assets/icons/box.svg'
import file from '@/assets/icons/file.svg'
import boxCheck from '@/assets/icons/box-check.svg'

import { mapGetters } from 'vuex'

export default {
  props: ['icon', 'width', 'primaryHover', 'color', 'progress', 'svg', 'file'],
  data() {
    return {
      icons: {
        inbox, calendar, sun, arrow, star, user, out,
        sort, tag, priority, menu, tasks, archive,
        pen, trash, fire, bloqued, circle, users,
        copy, plus, globe, heading, search, note,
        envelope, deadline, sleep, repeat, box, file,
        "box-check": boxCheck,
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
    iconClick() {
      this.$emit('click')
      if (this.file && this.fileInput)
        this.fileInput.click()
    },
    handleFile() {
      const inp = this.fileInput
      this.$emit('add', inp.files[0])
    }
  },
  computed: {
    ...mapGetters(['platform']),
    getIcon() {
      return this.icons[this.icon]
    },
    fileInput() {
      return this.$refs['file']
    },
    getWidth() {
      const defaultWidth = this.hasProgress ? '15px' : '20px'
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

.icon {
  display: inline-block;
}

.primaryHover:hover {
  color: var(--primary) !important;
}

.icon:active {
  color: var(--light-gray) !important;
}

.svg {
  left: 0;
  top: 0;
  border-radius: 50%;
  transform: rotate(-90deg);
  position: absolute;
}

.pie-wrapper {
  position: relative;
  transform: translateY(4px);
  display: inline-block;
  stroke: var(--white);
}

.pie {
  fill: none;
  transition-duration: .7s;
  transition: color 0s;
  stroke-width: 32;
  r: 16;
  cx: 16;
  cy: 16;
}

.light {
  stroke: var(--white);
}

.outline {
  position: absolute;
  left: -4px;
  top: -4px;
  border-radius: 100px;
}

</style>
