<template>
  <div class="AppbarElement AppbarElement-link rb"
    :tabindex="tabindex"
    :class="platform"
  >
    <div
      class="link-wrapper handle cursor remove-highlight AppbarElement-link rb"
      :data-type='type'
      :data-selectedtype='selectedtype'
      :data-color='iconColor'
      :data-disabled='disableAction'
      :class="{notSmartActive: !isSmart && isActive, isSelectedEl, onHover: hover}"

      @mouseenter="hover = true"
      @mouseleave="hover = false"
      @click.stop="linkCallback"
      @touchstart.passive='touchStart'
      @touchmove.passive='touchmove'
      @touchend.passive='touchEnd'
    >
      <div class="icon-wrapper">
        <Icon class="main-icon"
          :style="hoverStyle"
          :class="{notActive: !isActive}"
          :icon="icon"
          :progress='progress'
          :circle='true'
        />
      </div>
      <div class="name-wrapper">
        <transition name="name-t">
          <span v-if="!showSpecialInfo" key="normal" class="name" :style="hoverStyle">{{ getName }}</span>
          <span v-else class="name" key="apply" :style="hoverStyle">{{ l['Apply selected tasks'] }}</span>
        </transition>
        <div class="info">
          <template v-if="helpIcons">
            <Icon v-for="i in helpIcons" :key="i" class="inf faded"
              :icon='i'
              :circle='true'
            />
          </template>
          <span v-if="getStringObj" :style="{color: getStringObj.color}">{{ getStringObj.name }}</span>
          <span v-if="importantNumber" class="inf important">{{ importantNumber }}</span>
          <span v-if="totalNumber" class="inf total">{{ totalNumber }}</span>
        </div>
      </div>
      <CircleBubble class="bubble"
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
    <div v-if="subList && subList.length > 0" class="sub-list">
      <Renderer
        v-bind="$props"

        :enableSort='true'
        :showColor='true'
        :list="subList"

        :mapNumbers='mapSubTagNumbers'
        @buttonAdd='onSubTagAdd'
        @update='onSubTagUpdate'
      />
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'

import { mapGetters, mapState, mapActions } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options', 'totalNumber', 'importantNumber',
  'disableAction', 'selected', 'id', 'progress', 'helpIcons', 'string', 'onSubTagSortableAdd', 'onSubTagAdd', 'selectedtype', 'showColor', 'subList', 'mapSubTagNumbers', 'onSubTagUpdate'],
  components: {
    Renderer: () => import('./Renderer.vue'),
    Icon: IconVue,
    IconDrop: IconDropVue,
  },
  data() {
    return {
      hover: false,
      isTouching: false,
      fail: false,
      startTime: 0,

      selectedTasks: [],
    }
  },
  mounted() {
    this.bindOptions()
  },
  methods: {
    ...mapActions(['getOptions']),
    async bindOptions() {
      if (this.isDesktop) {
        if (this.options) {
          const el = this.$el.getElementsByClassName('link-wrapper')[0]
          utils.bindOptionsToEventListener(el, await this.getOptions(this.options), this)
        }
      }
    },
    async openMobileOptions() {
      window.navigator.vibrate(100)
      this.$store.commit('pushIconDrop', await this.getOptions(this.options))
    },
    touchStart(e) {
      this.isTouching = true
      this.fail = false
      this.startTime = new Date()
      this.initialScroll = document.scrollingElement.scrollTop
      const touch = e.changedTouches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY

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
    touchEnd() {
      clearTimeout(this.timeout)
      const time = new Date() - this.startTime

      if (!this.fail && time < 201)
          this.click()
      this.isTouching = false
      this.fail = false
    },
    linkCallback(evt) {
      if (this.isDesktop) this.click()
    },
    click() {
      if (this.callback && !this.showSpecialInfo) this.callback()
      else if (this.isOnControl && this.selectedEmpty) this.$emit('select')
      else if (this.showSpecialInfo && !this.selectedEmpty) {
        this.$emit('apply', {type: this.selectedtype || this.type, tasks: this.selectedTasks})
        this.$store.commit('clearSelected')
      }
    }
  },
  computed: {
    ...mapState({
      drag: 'drag',
      isOnControl: 'isOnControl',
      storeTasks: 'selectedTasks',
      viewName: 'viewName',
      storeViewType: 'viewType',
    }),
    ...mapGetters(['l', 'platform', 'isDesktop']),
    isDraggingOver() {
      return this
    },
    getStringObj() {
      if (!this.string) return null
      return {...this.string}
    },
    showSpecialInfo() {
      return this.hover && !this.isOnControl && !this.selectedEmpty
    },
    selectedEmpty() {
      return this.selectedTasks.length === 0
    },
    isSelectedEl() {
      return this.selected.includes(this.id)
    },
    getName() {
      if (this.isSmart) return this.l[this.name]
      return this.name
    },
    hoverStyle() {
      return `color: ${this.isActive ? this.iconColor : ''};`
    },
    isActive() {
      if ((this.hover && this.isDesktop) || (this.isTouching && !this.isDesktop)) return true
      return this.name === this.active && this.type === this.viewType || (this.viewName === this.name && this.type === this.storeViewType)
    },
  },
  watch: {
    storeTasks() {
      setTimeout(() => {
        this.selectedTasks = [...this.storeTasks]
      }, 50)
    },
    options() {
      this.bindOptions()
    },
  }
}

</script>

<style scoped>

.sub-list {
  margin-left: 20px;
}

.icon-wrapper {
  height: 100%;
  width: 40px;
  position: relative;
}

.name-wrapper {
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.main-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  margin-top: 1.5px;
  transition: color .15s;
}

.link-wrapper {
  height: 35px;
  position: relative;
  display: flex;
  overflow: hidden;
  transition-duration: .15s;
}

.mobile .link-wrapper {
  height: 42px;
}

.name {
  transition-duration: .15s;
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateY(0px);
}

.icon.notActive {
  color: var(--gray);
}

.AppbarElement {
  outline: none;
  position: relative;
  transition: background-color .15s, height .3s;
}

.sortable-ghost .name-wrapper, .sortable-ghost .icon-wrapper, .sortable-ghost .bubble {
  display: none;
}

.desktop .link-wrapper:hover, .notSmartActive {
  background-color: var(--card);
}

.link-wrapper:active {
  background-color: var(--card);
}

.sortable-drag {
  background-color: var(--card) !important;
}

.sortable-ghost .link-wrapper {
  background-color: var(--dark-void) !important;
  transition-duration: 0 !important;
  transition: none !important;
}

.info {
  display: flex;
  align-items: center;
  position: absolute;
  right: 6px;
  height: 100%;
  z-index: 5;
}

.inf {
  margin-left: 8px;
}

.faded {
  opacity: .6;
}

.drop {
  transform: translateY(2px);
}

.total {
  color: var(--gray);
}

#task-on-hover {
  transform: scale(1.01,1.01);
}

#task-on-hover .inf, #task-on-hover .icon, #task-on-hover .name {
  color: white !important;
  stroke: white;
}

/* .isSelectedEl {
  background-color: rgba(53, 73, 90, 0.6) !important;
} */

.name-t-enter {
  opacity: 0;
  transform: translateY(-25px); 
}

.name-t-enter-active, .name-t-leave-active {
  position: absolute;
  transition-duration: .15s;
}

.name-t-enter-to, .name-t-leave {
  transform: translateY(0px);
  opacity: 1;
}

.name-t-leave-to {
  opacity: 0;
  transform: translateY(25px);
}

.onHover {
  z-index: 10;
}

</style>
