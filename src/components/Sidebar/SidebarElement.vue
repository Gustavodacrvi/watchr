<template>
  <div class="SidebarElement SidebarElement-link rb"
    :tabindex="tabindex"
    :class="[platform, {hasSubList}]"
  >
    <div
      class="link-wrapper SidebarElement-link rb DRAG-AND-DROP-EL"
      :data-type='type'
      :data-id='id'
      :data-smart='isSmart'
      :data-disabled='disableAction'
    >
      <div
        class="link-inner-wrapper rb item-handle remove-highlight"
        :class="{notSmartActive: !isSmart && isActive, 'ignore-item': ignore, onHover: hover, isActive}"

        @mouseenter="hover = true"
        @mouseleave="hover = false"
        @click.stop="linkCallback"
        @touchstart.passive='touchStart'
        @touchmove.passive='touchmove'
        @touchend.passive='touchEnd'
      >
        <div class="icon-wrapper" @click="clickIcon">
          <Icon class="main-icon"
            :class="{cursor: icon === 'tasks'}"
            :style="iconStyle"
            :icon="icon"
            :progress='progress'
          />
        </div>
        <div class="name-wrapper">
          <transition name="name-t">
            <span key="normal" class="name" :style="hoverStyle">
              {{ getName }}
            </span>
          </transition>
        </div>
        <div class="info">
          <template v-if="helpIcons">
            <Icon v-for="i in helpIcons" :key="i" class="inf faded"
              :icon='i'
            />
          </template>
          <span v-if="getStringObj" :style="{color: getStringObj.color}">{{ getStringObj.name }}</span>
          <span v-if="importantNumber" class="inf important">{{ importantNumber }}</span>
          <span v-if="totalNumber" class="inf total">{{ totalNumber }}</span>
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
        width="26px"
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

import { mapGetters, mapState, mapActions } from 'vuex'

import utils from '@/utils/'

export default {
  props: ['name', 'icon', 'callback', 'iconColor', 'tabindex', 'active',
    'viewType', 'type', 'isSmart', 'options', 'totalNumber', 'importantNumber',
  'disableAction', 'id', 'progress', 'helpIcons', 'string', 'fallbackItem', 'onSubTagSortableAdd', 'onSubTagAdd', 'showColor', 'subList', 'getItemRef',
  'onItemAdd', 'mapSubTagNumbers', 'onSubTagUpdate', 'iconClick', 'ignore', 'inputPlaceholder', 'group', 'assigned', 'existingItems', 'alreadyExistMessage'],
  components: {
    Renderer: () => import('./Renderer.vue'),
    AssigneeProfilePhoto,
    IconDrop: IconDropVue,
  },
  data() {
    return {
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
    sublistEnter(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.overflow = 'hidden'
      s.height = 0
      s.opacity = 0
      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'
        s.height = this.sublistHeight
        s.opacity = 1
        setTimeout(() => {
          s.height = 'auto'
          s.overflow = 'visible'
          done()
        }, 310)
      })
    },
    sublistLeave(el, done) {
      const s = el.style
      
      s.height = this.sublistHeight
      requestAnimationFrame(() => {
        s.transitionDuration = '.3s'
        s.height = '0px'
        s.overflow = 'hidden'
        setTimeout(done, 310)
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
      if (this.isDesktop) this.click()
    },
    click() {
      if (this.callback) this.callback()
      else if (this.isOnControl && this.selectedEmpty) this.$emit('select')
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
      platform: 'platform',
      isDesktop: 'isDesktop',

      getGroupsById: 'group/getGroupsById',
      getAssignedTasksByList: 'task/getAssignedTasksByList',
    }),
    sublistHeight() {
      return ((this.subList.length) * (this.isDesktop ? 35 : 42)) + 'px'
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
    showSpecialInfo() {
      return this.hover && !this.isOnControl && !this.selectedEmpty
    },
    selectedEmpty() {
      return this.selectedItems.length === 0
    },
    getName() {
      if (this.isSmart) return this.name
      return this.name
    },
    hoverStyle() {
      return `color: ${this.isActive ? this.iconColor : ''};`
    },
    iconStyle() {
      if (this.isSmart)
        return `color: ${this.iconColor}`
      return `color: ${this.isActive ? this.iconColor : 'var(--fade)'};`
    },
    isActive() {
      if ((this.hover && this.isDesktop) || (this.isTouching && !this.isDesktop)) return true
      return this.name === this.active && this.type === this.viewType || (this.viewName === this.name && this.type === this.storeViewType)
    },
  },
  watch: {
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
  left: -24px;
}

.icon-wrapper {
  height: 100%;
  width: 40px;
  flex-shrink: 0;
  position: relative;
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
  margin-right: 6px;
  height: 100%;
  z-index: 5;
  font-size: .85em;
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

.link-wrapper {
  height: 35px;
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
  transition-duration: .2s;
  height: 100%;
  overflow: hidden;
}

.mobile .link-wrapper {
  height: 42px;
}

.SidebarElement {
  outline: none;
  position: relative;
  user-select: none;
  transition: background-color .15s, height .3s;
}

.sortable-ghost .name-wrapper, .sortable-ghost .icon-wrapper, .sortable-ghost .bubble, .sortable-ghost .toggle-icon, .sortable-ghost .info {
  display: none;
}

.desktop .link-inner-wrapper:hover, .notSmartActive, .link-inner-wrapper:active, .isActive {
  background-color: var(--card);
}

.sortable-drag {
  background-color: var(--card) !important;
}

.sortable-ghost, .sortable-ghost .link-inner-wrapper {
  background-color: var(--dark-void) !important;
  transition-duration: 0 !important;
  transition: none !important;
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
