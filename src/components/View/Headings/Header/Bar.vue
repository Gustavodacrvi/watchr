<template>
  <div
    class="header"
    :class="layout"
    @click="click"
  >
    <Icon class="icon"
      :icon="getIcon"
      :color="getIconColor"
      :progress='progress'
      :shadow='true'
      :width="isDesktopBreakPoint ? '22px' : '30px'"
      @click="openMenu"
      :style="{filter: `drop-shadow(0 0 ${isDesktopBreakPoint ? 15 : 5}px ${getIconColor})`}"
    />
    <HeaderSearch v-if="!isDesktopBreakPoint"/>
    <span v-if="!editing || !isEditable"
      class="name"
      @click.stop="editing = true"
    >
      {{ getViewName }}
      <Icon v-if="scheduling || calendarDate"
        class="comp-icon primary-hover cursor"
        :icon='scheduling ? "star" : "calendar-star"'
        color='var(--fade)'
        width='14px'
        @click='$emit("open-main-comp")'
      />
    </span>
    <input v-else-if="isEditable"
      class="input"
      autocomplete="off"
      :value="title"
      @input='v => title = v.target.value'
      ref='input'
      @click.stop
      @keydown="keydown"
    >
    <transition name="line-t"
      @enter="lineEnter"
      @leave="lineLeave"
    >
      <div v-if="isEditable && editing" class="line"></div>
    </transition>
    <div class="drop passive">
      <Icon v-for="i in extraIcons" :key="i.icon"
        class="cursor opt remove-highlight primary-hover"
        :icon="i.icon"
        color='var(--fade)'
        :circle="true"
        @click="i.callback"
      />
      <IconDrop v-if="options && options.length > 0"
        class="opt"
        :handle="optionsHandle"
        handleColor="var(--fade)"
        :options="options"
       
      />
    </div>
  </div>
</template>

<script>

import IconDrop from '../../../IconDrop/IconDrop.vue'
import HeaderSearch from './HeaderSearch.vue'

import utils from '@/utils/'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    HeaderSearch,
    IconDrop,
  },
  props: ['optionsHandle', 'options', 'progress', 'extraIcons', 'viewNameValue', 'viewType', 'icon', 'viewName', 'saveHeaderName'],
  data() {
    return {
      editing: false,
      title: this.viewNameValue,
    }
  },
  created() {
    window.addEventListener('click', this.hide)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide)
  },
  methods: {
    click(event) {
      if (this.selectedItems.length > 0) event.stopPropagation()
    },
    hide() {
      this.editing = false
    },
    openMenu() {
      if (!this.isDesktopBreakPoint)
        this.$router.push('/menu')
    },
    lineEnter(el) {
      const s = el.style
      
      const inp = this.$refs.input
      if (inp) {
        s.left = inp.offsetLeft + 'px'
        s.opacity = '0'
        s.width = '0px'
        s.transitionDuration = '.0s'
        setTimeout(() => {
          s.transitionDuration = '.2s'
          s.width = inp.offsetWidth + 'px'
          s.opacity = '1'
        })
      }
    },
    keydown({key}) {
      if (key === "Enter" && this.isEditable) {
        if (this.saveHeaderName)
          this.saveHeaderName(this.title.trim())
        this.editing = false
      }
    },
    focusOnInput() {
      setTimeout(() => {
        const inp = this.$refs.input
        if (inp) inp.focus()
      }, 100)
    },
    lineLeave(el) {
      el.style.width = '0px'
      el.style.opacity = '0'
    },
  },
  computed: {
    ...mapState(['selectedItems', 'scheduling']),
    ...mapGetters(['layout', 'isDesktopBreakPoint', 'getIcon', 'getIconColor', 'isSmartList', 'calendarDate']),
    isEditable() {
      return !this.isSmartList && (this.viewType === 'list' || this.viewType === 'tag' || this.viewType === 'folder' || this.viewType === 'group') && this.isDesktopBreakPoint
    },
    getViewName() {
      if (this.calendarDate)
        return utils.getHumanReadableDate(this.calendarDate)
      return this.viewNameValue
    },
  },
  watch: {
    viewName() {
      this.editing = false
    },
    viewNameValue() {
      this.title = this.viewNameValue
    },
    editing() {
      if (this.editing)
        this.focusOnInput()
    },
  },
}

</script>

<style scoped>

.header {
  display: flex;
  align-items: center;
  z-index: 200;
}

.icon {
  position: relative;
  z-index: 2;
  margin-right: 16px;
}

.comp-icon {
  margin-left: 8px;
  transform: translateY(2.5px);
}

.name {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 1.5em;
  font-weight: bold;
  max-width: 550px;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.opt {
  margin-left: 8px;
}

.line {
  position: absolute;
  bottom: 0;
  display: inline-block;
  height: 2px;
  background-color: var(--txt);
}

.input {
  background-color: var(--back-color);
  border: none;
  font-size: 1.5em;
  width: 500px;
  font-weight: bold;
  outline: none;
}

.mobile.header {
  padding-top: 30px;
  margin-bottom: 24px;
  margin-left: 6px;
}

.drop {
  transform: translateY(3px);
  position: absolute;
  right: 0;
  display: flex;
  align-items: center;
}

.mobile .name {
  font-size: 1.15em;
}

.mobile .drop {
  margin-right: 5px;
}

</style>
