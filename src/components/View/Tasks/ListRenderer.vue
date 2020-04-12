<template>
  <div class="ListRenderer floating-btn-container" :class='[layout, `${comp}-ListRenderer`, {isHeading: !isRoot}]' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration"
        class="illustration"
        :style="{
          width: `calc(100% - ${width}px)`,
          left: (isDesktopBreakPoint ? width : 0) + 'px',
        }"
      >
        <Icon :icon='(icon === "logged-lists" ? "faded-logged-lists" : icon)' color='var(--sidebar-color)' width="100px"/>
      </div>
    </transition>
    <TimelineRuler v-if='showTimelineRuler'
      key='TIMELINE_RULER'
      v-model="timelineIncrement"
      @save='saveTimelineIncrement'
    />
    <transition name='new-items-t'>
      <div v-if='isRoot && newItemsArr.length' class='new-items'>
        <span>
          You have {{ newItemsArr.length }} new items.
        </span>
        <button
          class='new-items-btn'
          @click='newItemsButtonClick'
        >
          OK
        </button>
      </div>
    </transition>
    <transition-group
      appear
      :css='false'
      class="front item-renderer-root"
      :class="{isRootAndHaveItems: isRoot && lazyItems.length > 0}"
      ref='item-renderer-root'

      data-name='item-renderer'
      tag='div'

      v-bind='rootId'

      @dragenter='dragenter'
      @dragover='dragover'
      @drop='drop'
      @dragleave.stop

      @enter='enter'
      @leave='leave'
    >
      <template v-for="item of getItems">
        <div v-if='item.cameFromAnotherTab'
          :key="item.cameFromAnotherTab + 'fdskçalsdf'"
          class='cameFromAnotherTab-ghost rb'
        >

        </div>
        <component v-else-if="!item.isEdit" :is='comp'
          v-bind="$props"
          :ref='item.id'
          :key="item.id"

          :itemHeight='itemHeight'
          :item='item'
          :viewName='viewName'
          :viewType='viewType'
          :timelineIncrement='timelineIncrement'
          :isRoot='isRoot'
          :changingView='changingRootView || changingView'
          :newItemsObj='rootItemsObj || newItemsObj'
          :listRenderer='true'
          :isSelecting='isSelecting'
          :multiSelectOptions='itemIconDropOptions'
          :comp='comp'
          :movingItem='movingItem'

          @de-select='deSelectItem'
          @select='selectItem'
          @add-item-after='addItemAfterSelection'
          @add-heading-after='addHeadingAfterSelection'
          @go='moveItemHandlerSelection'

          :data-id='item.id'
          :data-name='item.name'
          :data-type='comp'
          data-transition='display'
        />
        <component v-else
          :is='item.editComp || editComp'
          :key="item.isEdit + 'component eidt'"
          :ref="item.isEdit + 'component eidt'"
          :data-id="item.isEdit + 'component eidt'"

          v-bind='item.propsData'
          :focusToggle='focusToggle'
          :isAdding='true'
          :itemHeight='itemHeight'
          :itemModelFallback='itemModelFallback'
          :listRenderer='true'
          :fallbackItem='fallbackItem'

          @save='item.onSave'
          @goup='moveEdit(-1)'
          @godown='moveEdit(1)'
          @cancel='removeEdit'
          data-transition='edit'
        />
      </template>
      <div v-if="!moving && !hasEdit"
        key='LIST_IFON_SHOWSOMEDAYiTEMS'
        class='list-info'
      >
        <transition name="fade-t">
          <div v-if="computedShowSomedayButton && !isElementFromAnotherTabHovering"
            @click="$emit('allow-someday')"
          >
            <ButtonVue type="no-padding" value="Show someday items..."/>
          </div>
        </transition>
        <transition name="fade-t">
          <div v-if="computedShowArchivedHeadings && !isElementFromAnotherTabHovering"
            @click="showArchived = true"
          >
            <ButtonVue type="no-padding" value="Show archived headings..."/>
          </div>
        </transition>
        <ButtonVue v-if="showMoreItemsButton && !isElementFromAnotherTabHovering"
          type="no-padding"
          :value='showMoreItemsMessage'
          @click="showingMoreItems = true"
        />
        <div v-if="showAddItemButton && !isElementFromAnotherTabHovering"
          class="add-item-wrapper"
        >
          <div
            class="add-item rb"
            @click.stop="appendItem"
          >
            Add item
          </div>
        </div>
        <div v-if="isDesktopDevice && !isElementFromAnotherTabHovering && viewType === 'list' && !isSmart"
          class="heading-add"
          @click.stop="addHeadingsEdit(lazyItems.length)"
        >
          <span class="heading-add-line"></span>
          <span class="heading-add-message">
            Add heading
          </span>
        </div>
      </div>
    </transition-group>
    <HeadingsRenderer v-if="isRoot && getHeadings.length > 0"
      ref='headings'
      
      :viewName='viewName'
      :viewType='viewType'
      :viewNameValue='viewNameValue'
      :itemModelFallback='itemModelFallback'
      :showingRuler='showingRuler'
      :headings='getHeadings'
      :headingEditOptions='headingEditOptions'
      :isSmart='isSmart'
      :newItemsObj='newItemsObj'
      :comp='comp'
      :changingView='changingView'
      :editComp='editComp'
      :itemIconDropOptions='itemIconDropOptions'
      :showAllHeadingsItems='showAllHeadingsItems'
      :itemCompletionCompareDate='itemCompletionCompareDate'
      :mainFallbackItem='mainFallbackItem'
      :disableSortableMount='disableSortableMount'
      :onAddExistingItem='onAddExistingItem'
      :isRootAddingHeadings='isAddingHeadings'
      :getItemFirestoreRef='getItemFirestoreRef'
      :showHeadingFloatingButton='showHeadingFloatingButton'
      :justAddedHeading='justAddedHeading'
      :updateHeadingIds='updateHeadingIds'
      :itemPlaceholder='itemPlaceholder'
      :disableFallback='disableFallback'

      @added-heading-complete-mount='justAddedHeading = null'
      @go='moveItemHandlerSelection'
      @add-heading='addHeadingFromRootHeadings'
      @set-changing-view-timeout='setChangingViewTimeout'
      @headings-items-ids='getHeadingsItemsIds'
    />
  </div>
</template>

<script>

import Vue from 'vue'

// import Task from './Task.vue'
import TimelineRuler from './TimelineRuler.vue'
import TaskEdit from './Edit.vue'
import ListEdit from './../Lists/Edit.vue'
import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import EditComp from './../RenderComponents/Edit.vue'
import ButtonVue from '@/components/Auth/Button.vue'
import HeadingsRenderer from './HeadingsRenderer.vue'

import Task from "../Item/Task.vue"
import List from "../Item/List.vue"
import Heading from "../Item/Heading.vue"

import { fire } from '@/store/'
import { uid, setTask } from '@/utils/firestore'

import autoScheduleMixin from "@/mixins/autoSchedule"

import { mapState, mapGetters } from 'vuex'

import { Sortable } from 'sortablejs'

import mom from 'moment'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  mixins: [autoScheduleMixin],
  props: ['items', 'headings','header', 'viewName', 'addItem', 'viewNameValue', 'icon', 'headingEditOptions', 'headingPosition', 'showEmptyHeadings', 'showHeading', 'hideFolderName', 'hideListName', 'hideGroupName', 'showHeadingName', 'isSmart', 'disableDeadlineStr', 'updateHeadingIds',  'mainFallbackItem' ,'disableSortableMount', 'showAllHeadingsItems', 'rootFallbackItem', 'headingFallbackItem', 'addedHeading', 'changingRootView', 'rootFilterFunction', 'isRootAddingHeadings', 'onSortableAdd',
  'disableRootActions', 'showHeadingFloatingButton', 'allowLogStr', 'headingFilterFunction', 'showSomedayButton', 'openCalendar', 'width', 'disableCalendarStr', 'showingRuler', 'itemModelFallback', 'rootItemsObj',
  'rootHeadings', 'viewType', 'itemIconDropOptions', 'newItemsViewAlert', 'itemCompletionCompareDate', 'comp', 'editComp', 'itemPlaceholder', 'getItemFirestoreRef', 'onAddExistingItem', 'disableSelect', 'group',
   'disableFallback', 'getCalendarOrderDate'],
  components: {
    Task, ButtonVue, List, ListEdit,
    HeadingsRenderer, TaskEdit,
    Illustration: IllustrationVue,
    TimelineRuler, Heading,
  },
  data() {
    return {
      showingMoreItems: false,
      lazyItems: [],
      lazyHeadings: [],
      selectedElements: [],
      disableItemEnterTransitionIds: [],
      droppedIds: [],
      changingView: true,
      changingViewTimeout: null,

      timelineIncrement: null,

      addedItem: null,
      edit: null,
      focusToggle: false,
      movingItem: false,

      hasEdit: null,
      lastSelectedId: null,
      lastHeadingName: null,
      lastButtonElement: null,
      editMoveType: 'add',
      headingsItemsIds: [],
      lazyItemsSetTimeouts: [],
      lazyHeadingsSetTimeouts: [],
      oldRemovedIndicies: [],
      showArchived: false,
      cameFromAnotherTab: false,
      cameFromAnotherTabIndex: null,

      isAboutToMoveBetweenSortables: false,
      sourceVueInstance: null,
      justAddedHeading: false,
      isAddingHeadings: false,
      newItemsStorageSave: false,

      completeAnimationStack: [],
      completeAnimationSettimeout: null,
    }
  },
  created() {
    this.updateItems()
    if (this.isRoot) {
      this.updateHeadings()
    }
  },
  mounted() {
    if (this.header && this.header.name === this.addedHeading) {
      if (this.getItems.length === 0)
        this.addEditComp(0)
      this.$emit('added-heading-complete-mount')
    }
    this.mountSortables()
    window.addEventListener('click', this.windowClick)
    window.addEventListener('touchmove', this.mousemove)
    if (this.isDesktopDevice) {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('mousemove', this.mousemove)
    }

    this.emitIds()
  },
  beforeDestroy() {
    this.destroySortables()

    window.removeEventListener('click', this.windowClick)
    window.removeEventListener('touchmove', this.mousemove)
    if (this.isDesktopDevice) {
      window.removeEventListener('keydown', this.keydown)
      window.removeEventListener('mousemove', this.mousemove)
    }
  },
  methods: {
    setChangingViewTimeout() {
      if (this.changingViewTimeout)
        clearTimeout(this.changingViewTimeout)

      if (this.isRoot)
        this.changingViewTimeout = setTimeout(() => {
          this.changingView = false
          this.changingViewTimeout = null
        }, 100)
      else this.$parent.$emit('set-changing-view-timeout')
    },
    
    enter(el, done) {
      const id = el.dataset.id
      const type = el.dataset.transition
      if (!type || !id) {
        this.setChangingViewTimeout()
        return done()
      }

      const isAdding = type !== 'display'

      const vm = this.$refs[id][0].$refs.template

      const cont = vm.$refs['cont-wrapper']
      const s = cont.style
      
      s.transitionDuration = '0s'
      s.height = 0
      s.minHeight = 0
      
      if (isAdding) {
        return requestAnimationFrame(() => {
          s.transitionDuration = '.1s'
          s.height = this.itemHeight + 'px'
          setTimeout(() => {
            s.transitionDuration = '.15s'
            s.height = 'auto'
            vm.isEditing = true
            this.setChangingViewTimeout()
            done()
          }, 10)
        })
      }
      const parentIds = this.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(id)) {
        const i = parentIds.findIndex(id => id === id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = disableTransition ? 0 : '.15s'
        s.opacity = 1
        s.height = this.itemHeight + 'px'
        s.minHeight = this.itemHeight + 'px'
        
        setTimeout(() => {
          s.transitionDuration = '.15s'
          s.height = 'auto'
          this.setChangingViewTimeout()
          done()
        }, 151)
      })
    },
    leave(el, done) {
      const id = el.dataset.id
      const type = el.dataset.transition
      if (!id || !type || (type === 'edit'))
        return done()

      const vm = this.$refs[id][0].$refs.template

      const cont = vm.$refs['cont-wrapper']
      const parentIds = this.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(id)) {
        const i = parentIds.findIndex(id => id === id)
        parentIds.splice(i, 1)
        disableTransition = true
      }

      const s = cont.style

      s.transitionDuration = '0s'
      s.opacity = 1
      s.height = this.itemHeight + (vm.showInfo ? 8 : 0) + 'px'
      s.minHeight = this.itemHeight + (vm.showInfo ? 8 : 0) + 'px'

      const hideItem = () => {
        s.transitionDuration = disableTransition ? 0 : '.15s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(done, disableTransition ? 0 : 201)
      }

      requestAnimationFrame(() => {
        if (!vm.completeAnimation) {
          hideItem()
        } else {
          this.waitForAnotherTaskCompleteAnimation(hideItem)
        }
      })
    },


    newItemsButtonClick() {
      this.saveNewItemsIds(this.allItemsIds)
      this.newItemsStorageSave = !this.newItemsStorageSave
    },
    saveNewItemsIds(ids) {
      localStorage.setItem(this.newItemStorageKey, JSON.stringify(ids))
    },
    toggleCompletion(ids) {
      ids.forEach(id => this.findItem(id, vm => vm.toggleCompletion()))
      if (this.$refs.headings)
        this.$refs.headings.toggleCompletion(ids)
    },
    findItem(id, callback) {
      if (this.$refs[id] && this.$refs[id][0] && this.$refs[id][0].$refs.template)
        callback(this.$refs[id][0].$refs.template)
    },
    applyAutoScheduleToHeading(info, headingId, calendarDate) {
      this.$refs.headings.applyAutoScheduleToHeading(info, headingId, calendarDate)
    },
    applyAutoSchedule(obj, calendarDate) {
      if (this.comp === 'Task') {
        if (this.$refs.headings)
          this.$refs.headings.applyAutoSchedule(obj, calendarDate)
        return this.autoScheduleItems(this, calendarDate, obj, this.getItems)
      }
    },
    saveTimelineIncrement() {
      this.forEachItem(vm => vm.saveNewCalendarTime())
      this.$store.commit('clearSelected')
      this.timelineIncrement = 0
    },
    forEachItem(callback) {
      const keys = Object.keys(this.$refs)
      for (const k of keys) {
        if (this.$refs[k] && this.$refs[k][0] && this.$refs[k][0].$refs.template &&  this.$refs[k][0].$el)
          callback(this.$refs[k][0].$refs.template)
      }
    },
    selectAll() {
      if (this.isRoot && this.$refs.headings)
        this.$refs.headings.selectAll()
      this.forEachItem(vm => vm.selectItem())
    },
    appendItem() {
      this.addEditComp(this.nonEditGetItems.length)
    },
    filterHeading(h) {
      const showArchivedHeading = this.isSmart || this.showArchived || !h.archive
      if (!showArchivedHeading)
        return false
      if (
        this.showHeading && this.showHeading(h)
      ) {
        return true
      }

      return this.showEmptyHeadings || h.items.length > 0
    },
    dragenter(evt) {
      if (!this.moving && !this.hasEdit)
        evt.preventDefault()
    },
    dragover(evt) {
      this.cameFromAnotherTab = !this.moving && this.allowSortableAdd
      if (this.cameFromAnotherTab && !this.hasEdit) {
        const draggableRoot = this.draggableRoot
        this.$store.commit('cameFromAnotherTabDragStart', draggableRoot)
        evt.preventDefault()

        const getOffsetTop = elem =>{
          let offsetTop = 0
          do {
            if (!isNaN(elem.offsetTop)) {
              offsetTop += elem.offsetTop
            }
          } while(elem = elem.offsetParent)
          return offsetTop
        }

        const listLength = this.lazyItems.length
        const thresold = 1
        const itemHeight = this.itemHeight
        const mousePos = evt.pageY - getOffsetTop(draggableRoot)
        
        if (mousePos < (itemHeight + thresold))
          this.cameFromAnotherTabIndex = 0
        else if ((((listLength - 2) * itemHeight) - thresold) < mousePos) {
          this.cameFromAnotherTabIndex = listLength
        } else {
          }
        const pos = Math.floor(mousePos / itemHeight)
        this.cameFromAnotherTabIndex = pos === -1 ? 0 : pos
        
        
      } else {
        this.cameFromAnotherTab = false
      }
    },
    filterValidItemId(id) {
      return id && id !== 'Edit' && id !== 'Heading' && id !== 'EditComp' && id !== undefined && id !== 'Headingcomponent eidt'
    },
    drop(evt) {
      try {
        if (this.cameFromAnotherTab) {
          const res = evt.dataTransfer.getData('text/plain')
          if (!res) return;
          const obj = JSON.parse(evt.dataTransfer.getData('text/plain'))
          if (!obj) return;
          if (!obj.ids || !Array.isArray(obj.ids) || !obj.viewName || !obj.viewType) return;
          evt.preventDefault()
          let items = this.getTasksById(obj.ids)
          const alreadyHasItem = this.lazyItems.some(el => items.some(i => i.id  === el.id))
          
          if (!alreadyHasItem) {
            localStorage.setItem('WATCHR_BETWEEN_WINDOWS_DRAG_DROP', res)
            items = items.map(el => this.fallbackItem(el, true))
  
            this.lazyItems.splice(this.cameFromAnotherTabIndex, 0, ...items)
            const finalIds = this.lazyItems.map(el => el.id)
    
            this.addToList(finalIds, obj.ids)
          }
        }
      } catch (arr) {
        
      }
      this.cameFromAnotherTab = false
    },
    addToList(finalIds, itemsIds) {
      if (!this.onSortableAdd) {
        const b = fire.batch()
        const writes = []

        const items = this.getTasksById(itemsIds)

        items.forEach(el => setTask(b, this.fallbackItem(el, true), this.$store.state, el.id, writes))

        this.$emit('update', {finalIds, b, writes, itemsIds})
      } else {
        this.onSortableAdd(finalIds, itemsIds)
      }
    },
    
    waitForAnotherTaskCompleteAnimation(hideTaskFunc) {
      this.completeAnimationStack.push(hideTaskFunc)

      if (this.completeAnimationSettimeout)
        clearTimeout(this.completeAnimationSettimeout)
      
      this.completeAnimationSettimeout = setTimeout(() => {
        for (const animate of this.completeAnimationStack)
          animate()
        this.completeAnimationStack = []
      }, 1750)
    },
    
    getHeadingsItemsIds(ids) {
      this.headingsItemsIds = ids
    },
    emitIds() {
      if (this.isRoot)
        this.$parent.$emit('items-ids', this.allItemsIds)
      else
        this.$emit('items-ids', this.allItemsIds)
    },
    addHeadingFromRootHeadings(obj) {
      this.justAddedHeading = obj.name
      this.$emit("add-heading", obj)
    },
    moveItemHandlerSelection(bool) {
      this.$emit('go', bool)
    },
    mousemove(evt) {
      if (this.moving) {
        const addHeadingElement = document.querySelector('.ListRenderer .action-heading') || {}
        const createElement = document.querySelector('.ListRenderer .create') || {}
        
        const { left, width } = this.$el.getBoundingClientRect()
        const pos = (evt.pageX || evt.touches[0].pageX) - left
        
        const addHeading = pos < 76

        const show = s => {
          if (s) {
            s.opacity = 1
            s.transitionDuration = '.15s'
          }
        }
        const hide = s => {
          if (s) {
            s.opacity = 0
            s.transitionDuration = '.15s'
          }
        }

        if (!addHeading || !this.showHeadingFloatingButton) {
          this.editMoveType = 'create'

          show(createElement.style)
          hide(addHeadingElement.style)

        } else {
          this.editMoveType = 'action-heading'

          hide(createElement.style)
          show(addHeadingElement.style)
        }
      }
    },
    selectMultipleIds(newId) {
      if (this.lastSelectedId && newId && this.lazyItems.find(el => el.id === newId) && this.lazyItems.find(el => el.id === this.lastSelectedId)) {
        const idsToSelect = []

        let selecting = false
        for (const t of this.lazyItems) {
          const isOneOfTheTwo = t.id === this.lastSelectedId || t.id === newId
          if (selecting && !isOneOfTheTwo) {
            idsToSelect.push(t.id)
          } else if (!selecting && isOneOfTheTwo) {
            selecting = true
          } else if (isOneOfTheTwo) break
        }

        if (idsToSelect.length > 0) {
          const root = this.draggableRoot
          const childNodes = root.childNodes

          const nodes = []
          for (const node of childNodes) {
            if (node.dataset && idsToSelect.includes(node.dataset.id) && !nodes.includes(node)) {
              nodes.push(node)
            }
          }

          for (const node of nodes) {
            this.selectItem(node)
          }
        }
      }
    },
    moveEdit(offset) {
      const index = this.lazyItems.findIndex(el => el.isEdit)
      const move = () => {
        this.lazyItems.splice(
          offset + index,
          0,
          this.lazyItems.splice(index, 1)[0]
        )
      }
      if (offset > 0 && (offset + index) < this.lazyItems.length)
        move()
      else if ((index + offset) > -1)
        move()
      setTimeout(() => this.focusToggle = !this.focusToggle, 10)
    },
    removeEdit() {
      const i = this.lazyItems.findIndex(el => el.isEdit)
      if (i > -1) {
        this.lazyItems.splice(i, 1)
        this.edit = null
      }
    },
    addEdit(isEdit, index, onSave, propsData, editComp = undefined) {
      this.removeEdit()
      const edit = {
        isEdit,
        onSave,
        propsData,
        editComp,
      }
      this.lazyItems.splice(index, 0, edit)
      this.edit = {...edit}
    },
    addEditComp(index) {
      this.addEdit('Edit', index, this.add, {
        key: 'Edit',
        placeholder: this.itemPlaceholder,
        notesPlaceholder: 'Notes...', showCancel: true,
      })
    },
    addItemAfterSelection(dir) {
      this.addEditComp(this.getMainSelectionIndex + dir)
    },
    addHeadingAfterSelection(dir) {
      if (this.viewType === 'list' && !this.isSmart)
        this.addHeadingsEdit(this.getMainSelectionIndex + dir)
    },
    addHeadingsEdit(index) {
      const h = this.headingEditOptions
      const onSave = obj => {
        this.addHeading(obj)
        setTimeout(() => {
          this.removeEdit()
        }, 50)
      }
      this.addEdit('Heading', index, onSave, {
          key: 'Heading',
          ...h,
          names: h.excludeNames,
        }, 'Heading')
    },

    destroySortables() {
      if (this.sortable)
        this.sortable.destroy()
    },
    isItemRenderable(task) {
      return this.isRoot ? 
        this.rootFilterFunction(task) :
        this.headingFilterFunction(task)
    },
    mountSortables() {
      let cancel = true
      let lastEventTime = false
      let cancelTimeout = null

      let moveType = null
      let moveId = null
      let moveIsSmart = null
      let finalIds = []
      let divs = []
      let lastToElement = null

      const onMove = () => divs = []
      
      const obj = {
        disabled: this.disableSortableMount,
        multiDrag: this.enableSelect || !this.isDesktopDevice,
        direction: 'vertical',

        animation: 200,
        delay: this.isDesktopDevice ? 5 : 100,
        handle: '.item-handle',
        
        group: this.group || {
          name: 'item-renderer',
          pull: (e,j,item) => {
            const d = item.dataset
            const sortableRootName = e.el.dataset.name
            
            if (sortableRootName === 'sidebar-renderer') return true
            if (sortableRootName === 'folders-root') return true
            if (sortableRootName === 'scheduler' && this.comp === "Task") return true
            if (d.type === 'Task' && this.comp === "Task") return true
            if (d.type === 'List' && this.comp === 'List') return true
            return false
          },
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'headingbutton' || type === 'add-task-floatbutton') return !this.disableRootActions
            if (type === 'sidebar-element') return true
            if (!this.allowSortableAdd) return false
            if (type === 'Task' && this.comp === "Task") return true
            if (type === 'List' && this.comp === 'List') return true
            if (type === 'subtask') return true
            return false
          }
        },

        onUpdate: (evt) => {
          setTimeout(() => {
            this.$emit('update', {finalIds: this.getIds(true)})
          }, 10)
        },
        onSelect: evt => {
          const id = evt.item.dataset.id

          if (id !== "Edit" && !this.selected.includes(id)) {
            if (this.pressingMultiSelectKeys)
              this.selectMultipleIds(id)
            this.lastSelectedId = id


            this.saveType(id)
            this.$store.commit('selectItem', id)
          }
        },
        onDeselect: evt => {
          const id = evt.item.dataset.id
          this.$store.commit('unselectItem', id)
          if (this.selected.length === 0)
            setTimeout(() => {
              if (this.selected.length === 0)
                this.lastSelectedId = null
            })
        },
        onRemove: (evt) => {
          const {indicies, items, oldIndicies} = utils.getInfoFromAddSortableEvt(evt)
          utils.removeSortableItemsOnRemove(items, indicies, this.draggableRoot, this.deSelectItem)

          this.oldRemovedIndicies = oldIndicies.slice()
        },
        onAdd: (evt, original) => {
          const {type, ids, indicies, items} = utils.getInfoFromAddSortableEvt(evt)
          
          if ((type === 'Task' || type === 'List') && this.comp === 'List') {
            const listIds = this.lazyItems.map(el => el.id)
            listIds.splice(indicies[0], 0, ...ids)
            this.addToList(listIds, ids)
          } else if (type === 'Task' && this.addToList && this.sourceVueInstance) {
            this.removeEdit()
            this.sourceVueInstance.removeEdit()

            utils.moveItemsBetweenLists(
              this.sourceVueInstance.lazyItems,
              this.lazyItems,
              ids, indicies,
            )

            this.sourceVueInstance = null
            this.disableItemEnterTransitionIds = ids
            this.addToList(this.lazyItems.filter(el => el).map(el => el.id), ids)
          } else {  
            const i = evt.newIndex
            if (this.editMoveType === 'create')
              this.addEditComp(i)
            else if (this.editMoveType === 'action-heading')
              this.addHeadingsEdit(i)
          }
        },
        onMove: (t, e) => {
          const isTaskRender = t.to.classList.contains('item-renderer-root')
          const isComingFromAnotherTaskRenderer = t.to !== this.draggableRoot

          if (isTaskRender && isComingFromAnotherTaskRenderer) {
            let vue = t.related.__vue__ ||
                  t.related.parentNode.__vue__
            while (true) {
              if (vue.$el.classList && vue.$el.classList.contains('ListRenderer'))
                break
              else vue = vue.$parent
            }
            vue.sourceVueInstance = this
          } else if (t.to !== this.draggableRoot) {

            if ((new Date() - lastEventTime) < 50)
              return 1;
            
            const evt = t
            const taskIds = this.selected.slice()
            if (taskIds.length === 0)
              taskIds.push(evt.dragged.dataset.id)
            finalIds = taskIds
            
            const specialClass = 'DRAG-AND-DROP-EL'
            const containsInfo = el => el && el.classList && el.classList.contains(specialClass)
            
            let target = evt.related

            if (target) {
              if (!containsInfo(target))
                target = target.childNodes[0]
              if (target && target.nodeType === 1) {
                if (!containsInfo(target))
                  target = target.closest(`.${specialClass}`)
  
                if (containsInfo(target)) {
                  divs.unshift(target)
                  
                  const d = divs[0].dataset

                  cancel = false
                  
                  moveType = d.type
                  moveId = d.id
                  moveIsSmart = d.smart

                  lastToElement = evt.to
                }
              }
            }
            
            if (cancelTimeout)
              clearTimeout(cancelTimeout)
            cancelTimeout = setTimeout(() => {
              if (!this.isDraggingOverSidebarElement)
                  cancel = true
              }, 70)

            lastEventTime = new Date()

            return 1;
          }
        },
        onEnd: evt => {
          setTimeout(() => {
            const dropedIds = localStorage.getItem('WATCHR_BETWEEN_WINDOWS_DRAG_DROP')
            if (dropedIds) {
              const obj = JSON.parse(dropedIds)
              if (obj.ids && Array.isArray(obj.ids)) {
                obj.ids.forEach(id => {
                  const i = this.lazyItems.findIndex(el => el.id)
  
                  if (i > -1 && !this.isItemRenderable(this.lazyItems[i]))
                    this.lazyItems.splice(i, 1)
                })
                localStorage.setItem('WATCHR_BETWEEN_WINDOWS_DRAG_DROP', '')
              }
            }
          })
          
          this.$store.commit('moving', false)

          if (this.isDesktopDevice)
            window.removeEventListener('mousemove', onMove)
          
          if (!cancel) {
            const handle = obj => this.$store.dispatch('task/handleTasksBySidebarElementDragAndDrop', obj)

            this.droppedIds = finalIds
            setTimeout(() => this.droppedIds = [], 750)

            if (moveIsSmart)
              handle({
                type: moveId,
                taskIds: finalIds,
              })
            else
              handle({
                taskIds: finalIds,
                type: moveType,
                elIds: [moveId],
              })
          }
          let notRunned = 0

          for (const obj of this.oldRemovedIndicies) {
            const {multiDragElement} = obj
            const i = this.lazyItems.findIndex(el => el.id === multiDragElement.dataset.id)
            if (i > -1)
              this.lazyItems.splice(i, 1)
          }

          this.$nextTick(() => {
            for (const obj of this.oldRemovedIndicies) {
              const {index,multiDragElement} = obj
              const t = this.getTasksById([multiDragElement.dataset.id])[0]
              if (this.isItemRenderable(t)) {
                this.lazyItems.splice(index - notRunned, 0, t)
              } else {
                notRunned++
              }
            }
            this.oldRemovedIndicies = []
          })
          
          if (this.isDesktopDevice && this.comp === 'Task') {
            this.movingItem = false
            this.$store.commit('movingTask', false)
          }
        },
        setData: (dataTransfer, el) => {
          dataTransfer.setData('text/plain', JSON.stringify({
            ids: (this.selected.length > 0) ? this.selected : [el.dataset.id],
            viewName: this.viewName,
            viewType: this.viewType,
          }))
        },
        onStart: evt => {
          this.$store.commit('moving', true)
          
          if (this.isDesktopDevice)
            window.addEventListener('mousemove', onMove)
          
          cancel = true
          divs = []
          lastToElement = null
          moveIsSmart = null

          if (this.isDesktopDevice && this.comp === 'Task') {
            this.movingItem = true
            this.$store.commit('movingTask', true)
          }
          
          if (!this.isDesktopDevice)
            window.navigator.vibrate(20)
        },
        onChange: evt => {
          const item = evt.item
          if (item.dataset.type === 'add-task-floatbutton') {
            if (this.lastButtonElement !== item) {
              const s = item.childNodes[0].style

              this.lastButtonElement = item
  
              s.transitionDuration = '.0s'
              s.transitionTimingFunction = 'ease-out'
              s.overflow = 'hidden'
              s.height = 0
              s.opacity = 0
  
              requestAnimationFrame(() => {
                s.transitionDuration = '.1s'
                
                s.height = this.itemHeight + 'px'
                s.opacity = 1
              })
            }
          }
        },
      }
      if (!this.isDesktopDevice) {
        obj.forceFallback = true
        obj.fallbackOnBody = true
      }
      this.sortable = new Sortable(this.draggableRoot, obj)
    },
    addHeading(obj, ...args) {
      if (obj) {
        const i = this.getListRendererPosition()
        const ids = this.getIds(true)
        const headings = this.isRoot ? this.getHeadingsIds() : this.rootHeadings
        this.$emit('add-heading', {
          ids: ids.slice(i),
          obj, index: this.headingPosition,
          headings,
        })
        if (this.isRoot)
          this.justAddedHeading = obj.name
      }
    },
    click(event) {
      if (this.selected.length > 0) {
        let found = false
        for (const node of event.path) {
          if (node.classList && node.classList.contains('Task')) {
            found = true
            break
          }
        }

        if (found) event.stopPropagation()
      }
    },
    selectItem(el) {
      if (!this.selectedElements.includes(el)) {
        this.selectedElements.push(el)
        this.saveType(el.dataset.id)
        this.$store.commit('selectItem', el.dataset.id)
        Sortable.utils.select(el)
      }
    },
    saveType(id) {
      if (this.selectedType !== this.comp) {
        this.$store.commit('clearSelected')
        setTimeout(() => {
          this.$store.commit('selectItem', id)
        })
      }
      this.$store.commit('selectType', this.comp)
    },
    deselectAll() {
      const els = this.selectedElements
      for (const e of els)
        this.deSelectItem(e)
    },
    deSelectItem(el) {
      this.$store.commit('unselectItem', el.dataset.id)
      Sortable.utils.deselect(el)

      const i = this.selectedElements.findIndex(el => el === el)
      if (i > -1)
        this.selectedElements.splice(i, 1)
    },
    windowClick() {
      for (const el of this.selectedElements)
        if (this.lazyItems.find(t => t.id === el.dataset.id))
          this.deSelectItem(el)
      this.$store.commit('clearSelected')
    },
    fallbackItem(item, force) {
      let t = item

      if (this.mainFallbackItem)
        t = this.mainFallbackItem(item, force, this.header, true)
      if (this.isRoot && this.rootFallbackItem)
        t = this.rootFallbackItem(t, force, this.header, true)
      else if (this.headingFallbackItem)
        t = this.headingFallbackItem(t, force, this.header, true)

      return t
    },
    add(item, targetIndex, forceFallback) {
      if (item.name) {
        let t = item
        if (!this.disableFallback)
          t = this.fallbackItem(item, forceFallback)

        const isNotEditingFiles = !t.handleFiles
        let shouldRender = false

        if (isNotEditingFiles)
          shouldRender = this.isItemRenderable(t)

        const newItemRef = this.getItemFirestoreRef(this.header)

        t = {
          ...t,
          id: newItemRef.id,
          userId: uid(),
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
        }

        const index = targetIndex || this.getListRendererPosition()

        if (shouldRender) {
          this.saveNewItemsIds([...this.allItemsIds, t.id])
          this.lazyItems.splice(index, 0, t)
        }
        this.addedItem = t.id

        this.addItem({
          item: t, ids: this.getIds(true),
          newId: t.id,
          index, newItemRef,
          header: this.header,
        }, shouldRender)
      }
    },
    getListRendererPosition() {
      return this.lazyItems.findIndex(el => el.isEdit)
    },
    getHeadingsIds() {
      const el = this.$el.getElementsByClassName('headings-root')[0]
      if (el) {
        const childs = el.childNodes
        const arr = []
        for (const c of childs) {
          arr.push(c.dataset.id)
        }
        return arr
      }
      return []
    },
    getIds(removeAdders) {
      const childs = this.draggableRoot.childNodes
      let ids = []
      for (const el of childs)
        if (el.dataset)
          ids.push(el.dataset.id)
      if (removeAdders)
        ids = ids.filter(this.filterValidItemId)
      return ids
    },
    contWrapper(el) {
      return el.getElementsByClassName('cont-wrapper')[0]
    },
    keydown({key}) {
      if (!this.header && this.comp !== 'List') {
        const active = document.activeElement
        const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
        if (!isTyping && !this.isOnControl && !this.isOnAlt & !this.isEditing) {
          if (!this.disableRootActions) {
            if (key === 'a')
              this.addEditComp(this.lazyItems.length)
            else if (key === 'A')
              this.addEditComp(0)
          }
          if (this.viewType === 'list' && !this.isSmart) {
            if (key === 'h')
              this.addHeadingsEdit(this.lazyItems.length)
            else if (key === 'H')
              this.addHeadingsEdit(0)
          }
        }
      }
    },
    clearHeadingsTimeout() {
      if (this.lazyHeadingsSetTimeouts.length > 0) {
        this.lazyHeadingsSetTimeouts.forEach(clearTimeout)
        this.lazyHeadingsSetTimeouts = []
      }
    },
    clearItemsTimeout() {
      if (this.lazyItemsSetTimeouts.length > 0) {
        this.lazyItemsSetTimeouts.forEach(clearTimeout)
        this.lazyItemsSetTimeouts = []
      }
    },
    spliceNewItems(addedItems, lazyArrStr, timeoutProperty, timeout) {
      if (addedItems.length === 0)
        return;
      
      let i = 0
      const splice = ({index, item}) => {
        this[lazyArrStr].splice(index, 0, item)
        if ((i + 1) !== addedItems.length)
          this[timeoutProperty].push(
            setTimeout(() => {
              i++
              if (addedItems[i])
                splice(addedItems[i])
            }, timeout)
          )
      }

      splice(addedItems[0])
      
    },
    updateChangedItems(sliceComputedStr, lazyArrStr, timeoutProperty, timeout) {
      const newItems = this[sliceComputedStr]

      const has = item => this[lazyArrStr].some(el => el.id === item.id)
      
      const finalItems = []
      const addedItems = []

      newItems.forEach((el, index) => {
        if (has(el))
          finalItems.push(el)
        else {
          addedItems.push({
            item: el,
            index,
          })
        }
      })

      this[lazyArrStr] = finalItems

      this.spliceNewItems(addedItems, lazyArrStr, timeoutProperty, timeout)
    },
    updateHeadings() {
      this.clearHeadingsTimeout()
      this.updateChangedItems('slicedHeadings', 'lazyHeadings', 'lazyHeadingsSetTimeouts', this.isDesktopDevice ? 175 : 250)
    },
    updateItems() {
      this.clearItemsTimeout()
      let foundEdit
      if (this.hasEdit && this.addedItem && this.edit) {
        const oldEditIndex = this.lazyItems.findIndex(el => el.isEdit)
        if (oldEditIndex > -1) {
          foundEdit = true
          this.lazyItems.splice(oldEditIndex, 1)
        }
      }

      this.updateChangedItems('slicedItems', 'lazyItems', 'lazyItemsSetTimeouts', this.isDesktopDevice ? 15 : length * 5)

      if (foundEdit) {
        const itemIndex = this.lazyItems.findIndex(el => el.id === this.addedItem)
        if (itemIndex > -1) {
          this.lazyItems.splice(itemIndex + 1, 0, this.edit)
        }
      }

      const removedEls = this.selectedElements.filter(el => el && !this.lazyItems.find(t => t.id === el.dataset.id))
      for (const el of removedEls)
        this.deSelectItem(el)

    },
  },
  computed: {
    ...mapState({
      isDraggingOverSidebarElement: state => state.isDraggingOverSidebarElement,
      isEditing: state => state.isEditing,
      cameFromAnotherTabHTMLElement: state => state.cameFromAnotherTabHTMLElement,
      selected: state => state.selectedItems,

      isOnControl: state => state.isOnControl,
      isOnAlt: state => state.isOnAlt,

      selectedType: state => state.selectedType,
      isOnShift: state => state.isOnShift,
      pressingKey: state => state.pressingKey,
      mainSelection: state => state.mainSelection,
      toggleClipboardPaste: state => state.toggleClipboardPaste,

      moving: state => state.moving,
    }),
    ...mapGetters({
      calendarDate: 'calendarDate',
      itemHeight: 'itemHeight',
      savedTasks: 'task/tasks',
      layout: 'layout',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      isDesktopDevice: 'isDesktopDevice',
      getTaskBodyDistance: 'task/getTaskBodyDistance',
      getTasksById: 'task/getTasksById',
      getTagsByName: 'tag/getTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    newItemStorageKey() {
      return `watchr.listNewItemsIds-${this.viewType}-${this.viewName}`
    },
    newItemsArr() {
      if (!this.newItemsViewAlert || !this.newItemsViewAlert.includes(this.viewName))
        return []
      this.newItemsStorageSave
      const savedItems = JSON.parse(localStorage.getItem(this.newItemStorageKey) || "[]")

      return this.allItemsIds.filter(id => !savedItems.includes(id))
    },
    newItemsObj() {
      return this.newItemsArr.reduce((obj, id) => ({...obj, [id]: true}), {})
    },
    showTimelineRuler() {
      return this.comp === "Task" && this.calendarDate && this.showingRuler && this.selected.length > 0 && this.selected.every(id => this.getItems.some(item => item.id === id))
    },
    slicedHeadings() {
      return this.showEmptyHeadings ? this.headings.slice() : this.headings.filter(this.filterHeading)
    },
    slicedItems() {
      if (this.isRoot || this.showAllHeadingsItems) return this.items
      return this.showingMoreItems ? this.items : this.items.slice(0, this.hasEdit ? 4 : 3)
    },
    rootId() {
      if (this.isRoot && this.comp === "Task")
        return {id: `item-renderer-root`}
    },
    allowSortableAdd() {
      return this.mainFallbackItem && (
        this.isRoot ?
        this.rootFallbackItem :
        this.headingFallbackItem
      )
    },
    showAddItemButton() {
      return this.isDesktopDevice && !this.moving && !this.disableRootActions && !this.disableSortableMount
    },
    allItemsIds() {
      if (!this.isRoot)
        return this.getItems.map(el => el.id).filter(this.filterValidItemId)
      return [...this.getItems.map(el => el.id), ...this.headingsItemsIds].flat().filter(this.filterValidItemId)
    },
    getMainSelectionIndex() {
      return this.lazyItems.findIndex(i => i.id === this.mainSelection)
    },
    isElementFromAnotherTabHovering() {
      return this.cameFromAnotherTab && this.cameFromAnotherTabHTMLElement === this.draggableRoot
    },
    getItems() {
      const items = this.lazyItems.filter(el => el)
      if (!this.isElementFromAnotherTabHovering)
        return items

      items.splice(this.cameFromAnotherTabIndex, 0, {
        cameFromAnotherTab: true,
      })
      return items
    },
    nonEditGetItems() {
      return this.getItems.filter(el => !el.isEdit)
    },
    nonEditItems() {
      return this.items.filter(el => !el.isEdit)
    },
    computedShowArchivedHeadings() {
      return this.isRoot && !this.isSmart && this.hasArchivedHeading && !this.showArchived
    },
    computedShowSomedayButton() {
      return this.isRoot & this.showSomedayButton
    },
    showMoreItemsMessage() {
      return `Show ${this.items.length - 3} more items...`
    },
    showMoreItemsButton() {
      return !this.isRoot && !this.showAllHeadingsItems && !this.showingMoreItems && this.nonEditItems.length > 3
    },
    hasArchivedHeading() {
      return this.lazyHeadings.some(h => h.archive)
    },
    getHeadings() {
      return this.lazyHeadings.filter(this.filterHeading)
    },
    isRoot() {
      return !this.header
    },
    app() {
      return document.getElementById('app')
    },
    pressingMultiSelectKeys() {
      return this.isOnShift
    },
    pressingSelectKeys() {
      return this.isOnControl
    },
    enableSelect() {
      if (this.disableSelect) return false
      return this.openCalendar || !this.isDesktopDevice ||
      (this.pressingSelectKeys || this.isSelecting)
    },
    isSelecting() {
      if (this.selected.length > 0 || this.openCalendar) return true
      if (this.isDesktopDevice)
        return this.pressingSelectKeys
    },
    draggableRoot() {
      return this.$refs['item-renderer-root'].$el
    },
    showIllustration() {
      const getHeadings = this.getHeadings
      for (const head of getHeadings)
        if (head.items.length > 0) return false
      return this.isRoot && this.lazyItems.length === 0 && getHeadings.length === 0 && this.icon && !this.header
    },
  },
  watch: {
    selected() {
      const ids = this.selected
      const removedEls = this.selectedElements.filter(el => el && !ids.find(id => id === el.dataset.id))
      for (const el of removedEls)
        this.deSelectItem(el)
    },
    toggleClipboardPaste() {
      const task = this.$store.state.clipboardTask
      if (task && this.getMainSelectionIndex > -1) {
        this.$store.commit('addTaskToClipboard', null)
        this.add(task, this.getMainSelectionIndex + 1, true)
      }
    },
    lazyItems() {
      this.hasEdit = this.lazyItems.some(el => el.isEdit)
    },
    items() {
      this.updateItems()
    },
    showMoreItemsButton() {
      this.updateItems()
    },
    headings(newArr) {
      if (this.isRoot) {
        this.updateHeadings()
      }
    },
    viewName() {
      if (this.isRoot)
        this.changingView = true
      this.deselectAll()
      if (this.sortable)
        this.sortable.options.disabled = this.disableSortableMount
    },
    enableSelect() {
      if (this.sortable && this.isDesktopDevice) {
        setTimeout(() => {
          this.sortable.options.multiDrag = this.enableSelect
        })
      }
    },
    allItemsIds() {
      this.emitIds()
    },
  }
}

</script>

<style scoped>

.illustration {
  position: fixed;
  height: 100%;
  min-height: 100%;
  display: flex;
  top: 0;
  justify-content: center;
  align-items: center;
  transition-duration: .15s;
}

.cameFromAnotherTab-ghost {
  height: 25px;
  background-color: var(--sidebar-color);
  transition: transform .15s;
}

.new-items {
  background-color: rgba(255, 255, 77, .2);
  color: var(--yellow);
  height: 28px;
  width: 100%;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  opacity: 1;
  border: 1px solid var(--yellow);
  transition-duration: .2s;
  margin-top: 55px;
}

.new-items-btn {
  background-color: var(--yellow);
  color: var(--dark);
  border-radius: 4px;
  padding: 1px 8px;
  transition-duration: .2s;
}

.new-items-btn:hover {
  background-color: white;
}

.new-items-t-enter, .new-items-t-leave-to {
  opacity: 0;
  height: 0;
  margin-top: 0;
  padding: 0;
  border: 0 solid var(--yellow) !important;
}

.new-items-t-leave, .new-items-t-enter-to {
  opacity: 1;
  height: 28px;
  border: 1px solid var(--yellow);
  padding: 0 6px;
  margin-top: 55px;
}

.mobile .illustration {
  transform: translateX(-7px);
}

.mobile .illustration {
  width: 100% !important;
}

.front {
  position: relative;
  z-index: 1;
}

.list-info {
  position: absolute;
  width: 100%;
}

.ListRenderer {
  position: relative;
  margin-top: 16px;
}

.isHeading {
  margin-top: 4px;
}

.ListRenderer.mobile {
  margin-top: 0;
}

.illus-trans-enter, .illus-trans-leave-to {
  opacity: 0;
  transform: translateY(25px);
}

.illus-trans-leave, .illus-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
}

.item-renderer-root {
  outline: none;
  position: relative;
  min-height: 25px;
  z-index: 2;
  height: 100%;
  transition-duration: .15s;
  margin: 35px 0;
}

.isHeading .item-renderer-root {
  margin: 0;
}

.heading-add {
  position: relative;
  transform: translateY(25px);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition-duration: .15s;
  cursor: pointer;
}

.heading-add:hover {
  opacity: 1;
}

.heading-add-line {
  position: absolute;
  height: 2px;
  border-radius: 50px;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--txt);
  z-index: 2;
}

.heading-add-message {
  position: relative;
  z-index: 3;
  padding: 0 16px;
  background-color: var(--back-color);
}

.add-item-wrapper {
  height: 25px;
  width: 100%;
}

.add-item {
  background-color: var(--sidebar-color);
  height: 0;
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(1,1);
  transition-duration: .15s;
  box-shadow: 0 0 0 transparent;
}

.add-item-wrapper:hover .add-item {
  height: 25px;
  opacity: 1;
  cursor: pointer;
  outline: none;
  background-color: var(--card);
  box-shadow: 0 0 8px rgba(0,0,0, .3);
}

.add-item-wrapper:active .add-item {
  transition-duration: .075s;;
  background-color: var(--light-gray)
}

.isRootAndHaveItems {
  margin: 55px 0;
}

.mobile .isRootAndHaveItems {
  margin: 25px 0;
}


</style>
