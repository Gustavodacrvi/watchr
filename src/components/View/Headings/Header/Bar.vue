<template>
  <div
    class="header"
    :class="layout"
  >
    <Icon class="icon"
      :class="{progress: progress !== undefined}"
      :icon="getIcon"
      :color="getIconColor"
      :progress='progress'
      :shadow='true'
      :width="isDesktopBreakPoint ? ((progress === undefined) ? '18px' : '14px') : '30px'"
      @click="openMenu"
      :style="{filter: `drop-shadow(0 0 ${isDesktopBreakPoint ? 15 : 5}px ${getIconColor})`}"
    />
    <HeaderSearch v-if="!isDesktopBreakPoint"/>
    <span
      class="name"
      @click.stop
    >
      {{ getViewName }}
      <Icon v-if="scheduling || calendarDate"
        class="comp-icon primary-hover cursor"
        :icon='scheduling ? "star" : "calendar-star"'
        color='var(--fade)'
        width='14px'
        @click='$emit("open-main-comp")'
      />
      <Icon v-else-if="headerConfig && headerConfig.length"
        class="comp-icon primary-hover cursor"
        icon='cog'
        color='var(--fade)'
        width='14px'
        @click='viewConfig'
      />
    </span>
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
  props: ['optionsHandle', 'options', 'progress', 'extraIcons', 'headerConfig','viewNameValue', 'viewType', 'icon', 'viewName', 'saveHeaderName'],
  methods: {
    openMenu() {
      if (!this.isDesktopBreakPoint)
        this.$router.push('/menu')
    },
    viewConfig() {
      this.$store.commit('pushIconDrop', this.headerConfig)
    },
  },
  computed: {
    ...mapState(['selectedItems', 'scheduling']),
    ...mapGetters(['layout', 'isDesktopBreakPoint', 'getIcon', 'getIconColor', 'isSmartList', 'calendarDate']),
    getViewName() {
      if (this.calendarDate)
        return utils.getHumanReadableDate(this.calendarDate)
      return this.viewNameValue
    },
  },
  watch: {
    viewNameValue() {
      this.title = this.viewNameValue
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
  margin-right: 6px;
  transform: translateY(.5px);
}

.progress {
  margin-right: 12px;
  transform: translateY(2px);
}

.comp-icon {
  margin-left: 4px;
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
