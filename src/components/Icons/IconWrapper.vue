<template>
  <div class="Icon">
    <span
      class="icon remove-highlight"
      :class="[{hideShadow: !shadow}, platform]"
      :style="{width: getWidth, color, filter: `drop-shadow(0 0 ${isDesktop ? 20 : 10}px ${color})`}"
      @click="iconClick"

      @mouseenter='iconEnter'
      @mouseleave="iconLeave"
    >
      <ActualIcon v-if="!hasProgress"
        :icon='icon'
      />
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
    </span>
    <span v-show="number" class="counter">
      <span class='num'>{{ number }}</span>
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

import ActualIcon from './Icon.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['icon', 'width', 'color', 'progress', 'svg', 'file', 'shadow', 'stop', 'title', 'number'],
  components: {
    ActualIcon,
  },
  data() {
    return {
      showingTitle: false,
      timeoutTitle: null,
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
    },
    handleFile() {
      const inp = this.fileInput
      if (inp.files.length > 0)
        this.$emit('add', inp.files)
      inp.value = ''
    },
  },
  computed: {
    ...mapGetters(['platform', 'isDesktop']),
    getProgress() {
      return 19 * this.progress / 100
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
  transform: scale(1,1);
}

.counter {
  position: absolute;
  left: -10px;
  top: -10px;
  padding: 6px;
  border-radius: 50px;
  background-color: var(--red);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 18px;
  height: 18px;
}

.num {
  transform: translateY(-1px);
}

.icon-title {
  position: absolute;
  top: 135%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 12px;
  font-size: .9em;
  background-color: var(--sidebar-color);
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
  border-bottom: 10px solid var(--sidebar-color);
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
  background-image: radial-gradient(rgba(0,0,0,0), var(--fade));
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
  stroke: var(--txt);
}

.pie {
  transition: color 0s, stroke-dasharray .7s;
  transform: rotate(-90deg);
  transform-origin: 50%;
}

.light {
  stroke: var(--txt);
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
