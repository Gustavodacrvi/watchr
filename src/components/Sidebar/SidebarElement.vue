<template>
  <div class="SidebarElement SidebarElement-link rb"
    :tabindex="tabindex"
    :class="[deviceLayout, {hasSubList}]"
  >
    <div
      class="link-wrapper SidebarElement-link rb DRAG-AND-DROP-EL"
      ref='link-wrapper'
      :data-type='type'
      :data-id='id'
      :data-smart='isSmart'
      :data-disabled='disableAction'
    >
      <div
        class="link-inner-wrapper rb item-handle remove-highlight"
        :class="{notSmartActive: !isSmart && isActive, 'ignore-item': ignore, onHover: hover, isActive, dragover}"

        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click="linkCallback"
        @touchstart.passive='touchStart'
        @touchmove.passive='touchmove'
        @touchend.passive='touchEnd'

        @dragover='dragover = true'
        @dragleave='dragover = false'
        @drop='dragover = false'
      >
        <div class="icon-wrapper" :class="{hasProgress: progress !== undefined}" @click="clickIcon">
          <Icon class="main-icon"
            :class="{cursor: icon === 'tasks', fadeIconColor}"
            :style="iconStyle"
            :icon="icon"
            :progress='progress'
            :width='progress !== undefined ? null : "13px"'
          />
        </div>
        <div class="name-wrapper">
          <span v-if='!editing'
            key="normal"
            class="name"
            @click="click"
            :style="hoverStyle"
          >
            {{ displayName }}
          </span>
          <input v-else
            class='edit-input'
            ref='editInput'
            v-model='editModel'
            @keydown='keydown'
          />
        </div>
        <div class="info">
          <template v-if="helpIcons">
            <Icon v-for="i in helpIcons" :key="i" class="inf faded"
              :icon='i'
            />
          </template>
          <span v-if="getStringObj" :style="{color: getStringObj.color}">{{ getStringObj.name }}</span>
          <span v-if="importantNumber" :style='{color: iconColor}' class="inf inf-num important">{{ importantNumber }}</span>
          <span v-if="totalNumber" class="inf inf-num total">{{ totalNumber }}</span>
          <AssigneeProfilePhoto v-if="group && assigneeProfile"
            class="assigned"
            :assigned='assigned'
            :owner='itemGroup.userId'
            :userPhoto='assigneeProfile.photoURL'
          />
          <span v-else-if="group && assignedToList" class="inf assigned">{{ assignedToList }}</span>
        </div>
      </div>
      <Icon v-if="hasSubList"
        class="toggle-icon cursor remove-highlight primary-hover"
        :class="{showingSublist}"
        icon="tiny-arrow"
        width="14px"
        :circle="true"
        @click="showingSublist = !showingSublist"
      />
    </div>
    <transition
      :css="false"
      @enter='sublistEnter'
      @leave='sublistLeave'
    >
      <div v-if="hasSubList && showingSublist"
        class="sub-list"
      >
        <Renderer
          v-bind="$props"

          :enableSort='true'
          :showColor='true'
          :isSubElement='true'
          :list="subList"
          :adderIcon='adderIcon'
          :saveItem='saveItem'
          :onSortableAdd='onSubTagSortableAdd'

          :inputPlaceholder='inputPlaceholder'
          :getItemRef='getItemRef'
          :fallbackItem='fallbackItem'

          :existingItems='existingItems'
          :alreadyExistMessage='alreadyExistMessage'

          :mapNumbers='mapSubTagNumbers'
          @buttonAdd='onSubTagAdd'
          @update='onSubTagUpdate'
          @add='onItemAdd'
        />
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../IconDrop/IconDrop.vue'
import AssigneeProfilePhoto from "@/components/View/RenderComponents/AssigneeProfilePhoto.vue"

import sidebarmixin from "@/mixins/sidebarmixin.js"

import { mapGetters, mapState, mapActions } from 'vuex'

import utils from '@/utils/'

export default {
  mixins: [sidebarmixin],
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options', 'totalNumber', 'importantNumber',
  'disableAction', 'id', 'progress', 'helpIcons', 'string', 'fallbackItem', 'onSubTagSortableAdd', 'onSubTagAdd', 'showColor', 'subList', 'getItemRef',
  'onItemAdd', 'mapSubTagNumbers', 'onSubTagUpdate', 'iconClick', 'ignore', 'inputPlaceholder', 'group', 'assigned', 'existingItems', 'alreadyExistMessage', 'saveItem', 'adderIcon'],
  components: {
    Renderer: () => import('./Renderer.vue'),
    AssigneeProfilePhoto,
    IconDrop: IconDropVue,
  },
  data() {
    return {
      dragover: false,
      hover: false,
      isTouching: false,
      fail: false,
      startTime: 0,
      showingSublist: false,

      selectedItems: [],
    }
  },
  mounted() {
    this.bindOptions()
  },
  methods: {
    ...mapActions(['getOptions']),
    async bindOptions() {
      if (this.isDesktopDevice) {
        if (this.options) {
          utils.bindOptionsToEventListener(this.$refs['link-wrapper'], await this.getOptions(this.options), this, 'contextmenu', obj => {
            if (obj && obj.action === 'EDIT_SIDEBAR') {
              this.edit()
              return false
            }
          })
        }
      }
    },
    async openMobileOptions() {
      window.navigator.vibrate(20)
      this.$store.commit('pushIconDrop', await this.getOptions(this.options))
    },
    sublistEnter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.overflow = 'hidden'
      s.height = 0
      s.opacity = 0
      requestAnimationFrame(() => {
        setTimeout(() => {
          s.transitionDuration = '.15s'
          s.height = this.sublistHeight
          s.opacity = 1
          setTimeout(() => {
            s.height = 'auto'
            s.overflow = 'visible'
            done()
          }, 310)
        })
      })
    },
    sublistLeave(el, done) {
      const s = el.style
      
      s.height = this.sublistHeight
      requestAnimationFrame(() => {
        setTimeout(() => {
          s.transitionDuration = '.15s'
          s.height = '0px'
          s.overflow = 'hidden'
          setTimeout(done, 310)
        })
      })
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
      if (this.isDesktopDevice) this.click()
    },
    click() {
      if (this.callback && !this.isOnControl) this.callback()
    },
    clickIcon(evt) {
      if (this.iconClick) {
        this.iconClick()
        evt.stopPropagation()
      }
    },
  },
  computed: {
    ...mapState({
      drag: 'drag',
      isOnControl: 'isOnControl',
      storeTasks: 'selectedItems',
      viewName: 'viewName',
      storeViewType: 'viewType',
    }),
    ...mapGetters({
      deviceLayout: 'deviceLayout',
      isDesktopDevice: 'isDesktopDevice',

      getGroupsById: 'group/getGroupsById',
      getAssignedTasksByList: 'task/getAssignedTasksByList',
    }),
    sublistHeight() {
      return ((this.subList.length) * (this.isDesktopDevice ? 19 : 42)) + 'px'
    },
    hasSubList() {
      return this.subList && this.subList.length > 0
    },
    assignedToList() {
      return this.getAssignedTasksByList(this.group, this.id)
    },
    itemGroup() {
      return !this.group ? undefined : this.getGroupsById([this.group])[0]
    },
    profiles() {
      return this.itemGroup.profiles
    },
    ownerProfile() {
      return this.profiles[this.itemGroup.userId]
    },
    assigneeProfile() {
      return this.profiles[this.assigned]
    },
    getStringObj() {
      if (!this.string) return null
      return {...this.string}
    },
    selectedEmpty() {
      return this.selectedItems.length === 0
    },
    hoverStyle() {
      return `color: ${this.isActive ? this.iconColor : ''};`
    },
    iconStyle() {
      if (this.isSmart)
        return `color: ${this.iconColor}`
      return `color: ${this.isActive ? this.iconColor : ''}`
    },
    fadeIconColor() {
      return !this.isSmart && !this.isActive
    },
    isActive() {
      if ((this.hover && this.isDesktopDevice) || (this.isTouching && !this.isDesktopDevice)) return true
      return this.name === this.active && this.type === this.viewType || (this.viewName === this.name && this.type === this.storeViewType)
    },
  },
  watch: {
    dragover() {
      this.$store.commit('toggleSidebarElementHover', this.dragover)
    },
    storeTasks() {
      setTimeout(() => {
        this.selectedItems = [...this.storeTasks]
      }, 50)
    },
    options() {
      this.bindOptions()
    },
  }
}

</script>

<style scoped src="@/assets/css/sidebarmixin.css"></style>

<style scoped>

.sub-list {
  margin-left: 14px;
}

.toggle-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-47%) rotate(-90deg);
  transition-duration: .3s;
}

.showingSublist {
  transform: translateY(-47%) rotate(0deg);
}

.desktop .toggle-icon {
  left: -14px;
}

.icon-wrapper {
  height: 100%;
  width: 22px;
  flex-shrink: 0;
  position: relative;
}

.hasProgress {
  margin-top: 1px;
}

.inf-num {
  margin-right: 6px;
}

.name-wrapper {
  position: relative;
  height: 100%;
  flex-basis: 100%;
  display: flex;
  align-items: center;
}

.info {
  display: flex;
  align-items: center;
  right: 6px;
  flex-shrink: 0;
  margin-right: 4px;
  height: 100%;
  font-size: .9em;
  z-index: 5;
}

.name {
  max-width: 100%;
  position: absolute;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  transition-duration: .15s;
  transform: translateY(0px);
}

.main-icon {
  position: absolute !important;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%) !important;
  margin-top: 1.5px;
  transition: color .15s;
}

.Folder .SidebarElement {
  color: var(--dark-txt);
}

.link-wrapper {
  height: 19px;
  position: relative;
  transition-duration: .15s;
}

.mobile.hasSubList .link-inner-wrapper {
  margin-left: 28px;
}

.link-inner-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  transform: scale(1,1); /* used for drag and drop */
  transition-duration: .15s;
  height: 100%;
  overflow: hidden;
}

.SidebarElement.mobile .link-wrapper {
  height: 42px;
}

.fadeIconColor {
  opacity: .25;
}

.SidebarElement {
  outline: none;
  position: relative;
  user-select: none;
}

.sortable-ghost.SidebarElement .name-wrapper, .sortable-ghost.SidebarElement .icon-wrapper, .sortable-ghost.SidebarElement .bubble, .sortable-ghost.SidebarElement .toggle-icon, .sortable-ghost.SidebarElement .info {
  display: none;
}

.desktop .link-inner-wrapper:hover, .notSmartActive, .link-inner-wrapper:active, .isActive {
  background-color: var(--card);
}

.slim-sidebar .desktop .link-inner-wrapper:hover, .slim-sidebar .notSmartActive, .slim-sidebar .link-inner-wrapper:active, .slim-sidebar .isActive {
  background-color: var(--dark-light-gray);
}

.sortable-drag {
  background-color: var(--card) !important;
}

.sortable-ghost.SidebarElement, .sortable-ghost.SidebarElement .link-inner-wrapper {
  background-color: var(--dark-void) !important;
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
}

.sortable-selected .link-inner-wrapper {
  background-color: rgba(87,160,222,.2) !important;
}

.inf {
  margin-left: 2px;
}

.faded {
  opacity: .6;
}

.drop {
  transform: translateY(2px);
}

.assigned {
  margin-left: 8px;
  margin-right: 4px;
}

.total {
  color: var(--fade);
}

#task-on-hover {
  transform: scale(1.01,1.01);
}

#task-on-hover .inf, #task-on-hover .icon, #task-on-hover .name {
  color: white !important;
  stroke: white;
}

.onHover {
  z-index: 10;
}

</style>
