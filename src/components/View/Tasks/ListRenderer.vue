<template>
  <div class="ListRenderer floating-btn-container" :class='[platform, `${comp}-ListRenderer`]' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration" class="illustration">
        <Icon :icon='icon' color='var(--appnav-color)' width="150px"/>
      </div>
    </transition>
    <div
      class="front item-renderer-root"
      :class="{dontHaveItems: lazyItems.length === 0}"
      :style="inflate"
      ref='item-renderer-root'

      data-name='item-renderer'
    >
      <template v-for="item of getItems">
        <component v-if="!item.isEdit" :is='comp' :key="item.id" 
          v-bind="$props"

          :itemHeight='itemHeight'
          :item='item'
          :changingViewName='isChangingViewName'
          :isRoot='isRoot'
          :isSelecting='isSelecting'
          :multiSelectOptions='itemIconDropOptions'

          @de-select='deSelectItem'
          @select='selectItem'
          @add-item-after='addItemAfterSelection'
          @add-heading-after='addHeadingAfterSelection'
          @go='moveItemHandlerSelection'
          @change-time='changeTime'

          :data-id='item.id'
          :data-name='item.name'
          :data-type='comp'
        />
        <component v-else-if="item.isEdit === 'Edit'"
          :is='editComp'
          :key="item.isEdit"

          v-bind='item.propsData'
          :focusToggle='focusToggle'
          :fallbackItem='fallbackItem'

          :data-id='item.isEdit'

          @save='item.onSave'
          @goup='moveEdit(-1)'
          @godown='moveEdit(1)'
          @cancel='removeEdit'
        />
        <EditComp v-else
          :key="item.isEdit"

          v-bind='item.propsData'

          :data-id='item.isEdit'

          @save='item.onSave'
          @goup='moveEdit(-1)'
          @godown='moveEdit(1)'
          @cancel='removeEdit'
        />
      </template>
      <transition name="fade-t">
        <div v-if="computedShowSomedayButton" @click="$emit('allow-someday')">
          <ButtonVue type="no-padding" value="Show someday items..."/>
        </div>
      </transition>
      <ButtonVue v-if="showMoreItemsButton"
        type="no-padding"
        :value='showMoreItemsMessage'
        @click="showingMoreItems = true"
      />
    </div>
    <HeadingsRenderer v-if="isRoot && getHeadings.length > 0"
      :viewName='viewName'
      :viewType='viewType'
      :viewNameValue='viewNameValue'
      :headings='getHeadings'
      :isChangingViewName='isChangingViewName'
      :headingEditOptions='headingEditOptions'
      :isSmart='isSmart'
      :comp='comp'
      :editComp='editComp'
      :itemIconDropOptions='itemIconDropOptions'
      :selectEverythingToggle='selectEverythingToggle'
      :showAllHeadingsItems='showAllHeadingsItems'
      :itemCompletionCompareDate='itemCompletionCompareDate'
      :mainFallbackItem='mainFallbackItem'
      :scheduleObject='scheduleObject'
      :onAddExistingItem='onAddExistingItem'
      :getItemFirestoreRef='getItemFirestoreRef'
      :showHeadingFloatingButton='showHeadingFloatingButton'
      :movingButton='movingButton'
      :updateHeadingIds='updateHeadingIds'
      :itemPlaceholder='itemPlaceholder'
      :disableFallback='disableFallback'

      @change-time='changeTime'
      @go='moveItemHandlerSelection'
      @add-heading='addHeadingFromRootHeadings'
    />
  </div>
</template>

<script>

import Vue from 'vue'

import Task from './Task.vue'
import List from './../Lists/List.vue'
import TaskEdit from './Edit.vue'
import ListEdit from './../Lists/Edit.vue'
import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import EditComp from './../RenderComponents/Edit.vue'
import Icon from '@/components/Icon.vue'
import ButtonVue from '@/components/Auth/Button.vue'
import HeadingsRenderer from './HeadingsRenderer.vue' 

import { serverTimestamp, uid } from '@/utils/firestore'

import { mapState, mapGetters } from 'vuex'

import { MultiDrag, Sortable } from 'sortablejs'

Sortable.mount(new MultiDrag())

import mom from 'moment'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  props: ['items', 'headings','header', 'onSortableAdd', 'viewName', 'addItem', 'viewNameValue', 'icon', 'headingEditOptions', 'headingPosition', 'showEmptyHeadings', 'showHeading', 'hideFolderName', 'hideListName', 'showHeadingName', 'isSmart', 'allowCalendarStr', 'updateHeadingIds',  'mainFallbackItem' ,'disableSortableMount', 'showAllHeadingsItems', 'rootFallbackItem', 'headingFallbackItem', 'movingButton', 'rootFilterFunction', 'showHeadingFloatingButton', 'headingFilterFunction', 'scheduleObject', 'showSomedayButton', 'openCalendar', 'rootChanging', 
  'rootHeadings', 'selectEverythingToggle', 'viewType', 'itemIconDropOptions', 'itemCompletionCompareDate', 'comp', 'editComp', 'itemPlaceholder', 'getItemFirestoreRef', 'onAddExistingItem', 'disableSelect', 'group',
   'disableFallback', 'isLast'],
  components: {
    Task, Icon, ButtonVue, List, ListEdit,
    EditComp, HeadingsRenderer, TaskEdit,
    Illustration: IllustrationVue,
  },
  data() {
    return {
      showingMoreItems: false,
      lazyItems: [],
      lazyItemsSetTimeouts: [],
      lazyHeadingsSetTimeouts: [],
      lazyHeadings: [],
      selectedElements: [],
      changedViewName: true,
      waitingUpdateTimeout: null,
      changingViewName: false,

      addedItem: null,
      hasEdit: null,
      edit: null,
      focusToggle: false,

      lastSelectedId: null,
      lastHeadingName: null,
      lastButtonElement: null,
      editMoveType: 'add',
      compHeight: 0,

      isAboutToMoveBetweenSortables: false,
      sourceVueInstance: null,
    }
  },
  created() {
    if (!this.isRoot)
      this.changedViewName = false
    this.updateView()
  },
  mounted() {
    this.getCompHeight()
    this.mountSortables()
    window.addEventListener('click', this.windowClick)
    window.addEventListener('touchmove', this.mousemove)
    if (this.isDesktop) {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('mousemove', this.mousemove)
    }
  },
  beforeDestroy() {
    this.destroySortables()
    window.removeEventListener('click', this.windowClick)
    window.removeEventListener('touchmove', this.mousemove)
    if (this.isDesktop) {
      window.removeEventListener('keydown', this.keydown)
      window.removeEventListener('mousemove', this.mousemove)
    }
  },
  methods: {
    getCompHeight() {
      const el = this.$refs['item-renderer-root']
      const offsetTop = el.getBoundingClientRect().top
      const height = document.documentElement.clientHeight
      this.compHeight = (height - offsetTop) + 'px'
    },
    changeTime(args) {
      this.$emit('change-time', args)
    },
    addHeadingFromRootHeadings(obj) {
      this.$emit("add-heading", obj)
    },
    moveItemHandlerSelection(bool) {
      this.$emit('go', bool)
    },
    mousemove(evt) {
      if (this.movingButton) {
        const addHeadingElement = document.querySelector('.ListRenderer .action-heading') || {}
        const createElement = document.querySelector('.ListRenderer .create') || {}
        const addElement = document.querySelector('.ListRenderer .add') || {}
        const obj = {
          'action-heading': addHeadingElement.style || {},
          create: createElement.style || {},
          add: addElement.style || {},
        }
        
        const { left, width } = this.$el.getBoundingClientRect()
        const pos = (evt.pageX || evt.touches[0].pageX) - left
        
        const headingStart = width * .333333
        const addStart = this.showHeadingFloatingButton ? width * .66666 : width * .5

        let type
        if (pos < headingStart)
          type = 'action-heading'
        else if (pos < addStart)
          type = 'create'
        else type = 'add'

        if (!this.showHeadingFloatingButton && type === 'action-heading')
          type = 'create'

        const possibleValues = ['action-heading', 'create', 'add']

        if (!this.showHeadingFloatingButton) {
          obj['action-heading'].flexBasis = '0px'
          obj['action-heading'].overflow = 'hidden'
        }
        const act = obj[type]
        for (const s of possibleValues)
          if (s !== type) {
            obj[s].backgroundColor = 'var(--appnav-color)'
            obj[s].zIndex = '1'
            obj[s].boxShadow = 'none'
          }

        act.backgroundColor = 'var(--dark-gray)'
        act.boxShadow = '0 3px 8px rgba(15,15,15,.3)'
        act.color = 'white'
        act.zIndex = '2'

        this.editMoveType = type
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
        this.hasEdit = false
        this.edit = null
      }
    },
    addEdit(isEdit, index, onSave, propsData) {
      this.removeEdit()
      const edit = {
        isEdit,
        onSave,
        propsData,
      }
      this.lazyItems.splice(index, 0, edit)
      this.hasEdit = true
      this.edit = {...edit}
    },
    addEditComp(index) {
      this.addEdit('Edit', index, this.add, {
        key: 'Edit',
        placeholder: this.itemPlaceholder,
        notesPlaceholder: this.l['Notes...'], showCancel: true,
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
      const onSave = name => {
        this.addHeading(name)
        setTimeout(() => {
          this.removeEdit()
        }, 50)
      }
      this.addEdit('EditComp', index, onSave, {
          key: 'EditComp',
          ...h,
          names: h.excludeNames,
        })
    },

    destroySortables() {
      if (this.sortable)
        this.sortable.destroy()
    },
    mountSortables() {
      let cancel = true
      let cancelTimeout = null

      let moveType = null
      let moveId = null
      let moveIsSmart = null
      let finalIds = []
      let lastToElement = null
      
      const obj = {
        disabled: this.disableSortableMount,
        multiDrag: this.enableSelect || !this.isDesktop,
        direction: 'vertical',

        forceFallback: true,
        fallbackOnBody: true,
        animation: 80,
        delay: this.isDesktop ? 0 : 100,
        handle: '.item-handle',
        
        group: this.group || {
          name: 'item-renderer',
          pull: (e,j,item) => {
            const d = item.dataset
            if (e.el.dataset.name === 'appnav-renderer') return 'clone'
            if (d.type === 'Task') return true
            return false
          },
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'headingbutton' || type === 'add-task-floatbutton') return true
            if (type === 'appnav-element') return true
            if (!this.onSortableAdd) return false
            if (type === 'Task') return true
            if (type === 'subtask') return true
            return false
          }
        },

        onUpdate: (evt) => {
          setTimeout(() => {
            this.$emit('update', this.getIds(true))
          })
        },
        onSelect: evt => {
          const id = evt.item.dataset.id

          if (id !== "Edit" && !this.selected.includes(id)) {
            if (this.pressingMultiSelectKeys)
              this.selectMultipleIds(id)
            this.lastSelectedId = id
            this.$emit('selectTask', id)
          }
        },
        onDeselect: evt => {
          const id = evt.item.dataset.id
          this.$emit('unselectTask', id)
          if (this.selected.length === 0)
            setTimeout(() => {
              if (this.selected.length === 0)
                this.lastSelectedId = null
            })
        },
        onAdd: (evt, original) => {
          const items = evt.items
          if (items.length === 0) items.push(evt.item)
          const type = items[0].dataset.type

          const repeated = items.map(el => el.dataset.id)
          const ids = []
          const set = new Set()
          for (const id of repeated) {
            if (!set.has(id)) {
              ids.push(id)
              set.add(id)
            }
          }
          const indicies = evt.newIndicies.map(el => el.index)
          if (indicies.length === 0) indicies.push(evt.newIndex)
          
          if (type === 'Task' && this.comp === 'List') {
            this.onSortableAdd(items, ids, indicies, this.getIds(true))
          } else if (type === 'Task' && this.onSortableAdd && this.sourceVueInstance) {
            this.removeEdit()
            this.sourceVueInstance.removeEdit()
            
            
            let sourceLazyTasks = this.sourceVueInstance.lazyItems
            let destinyLazyTasks = this.lazyItems

            const tasks = []
            for (const id of ids) {
              for (let i = 0;i < sourceLazyTasks.length;i++) {
                const t = sourceLazyTasks[i]
                if (t.id === id) {
                  tasks.push(t)
                  sourceLazyTasks.splice(i, 1)
                  break
                }
              }
            }

            for (let i = 0; i < ids.length;i++) {
              destinyLazyTasks.splice(indicies[i], 0, tasks[i])
            }

            setTimeout(() => {
              this.onSortableAdd(evt, ids, type, destinyLazyTasks.map(el => el.id))
            })
            this.sourceVueInstance = null
          } else {
            const i = evt.newIndex
            if (this.editMoveType === 'create')
              this.addEditComp(i)
            else if (this.editMoveType === 'action-heading')
              this.addHeadingsEdit(i)
            else
              this.onAddExistingItem(i, this.lazyItems, this.fallbackItem, () => {
                setTimeout(() => {
                  this.$emit('update', this.getIds(true))
                }, 10)
              })
          }
          for (const item of items) {
            item.remove()
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
            
            const evt = t
            const taskIds = this.selected
            if (taskIds.length === 0)
              taskIds.push(evt.dragged.dataset.id)
            finalIds = taskIds
            
            const specialClass = 'DRAG-AND-DROP-EL'
            const containsInfo = el => el.classList && el.classList.contains(specialClass)
            
            let target = evt.related

            if (target) {
              if (!containsInfo(target))
                target = target.childNodes[0]
              if (target && target.nodeType === 1) {
                if (!containsInfo(target))
                  target = target.closest(`.${specialClass}`)
  
                if (containsInfo(target)) {
                  const d = target.dataset
                  if (!lastToElement || lastToElement === evt.to || moveType === d.type || (moveType === 'folder' && d.type === 'list')) {
                    cancel = false
                    
                    moveType = d.type
                    moveId = d.id
                    moveIsSmart = d.smart
                  }

                  lastToElement = evt.to
                }
              }
            }

            if (cancelTimeout)
              clearTimeout(cancelTimeout)
            cancelTimeout = setTimeout(() => cancel = true, 70)
            
            return false
          }
        },
        onEnd: evt => {
          if (!cancel) {
            const handle = obj => this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', obj)
            
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
          
          if (this.isDesktop && this.comp === 'Task')
            this.$store.commit('movingTask', false)
        },
        onStart: evt => {
          cancel = true
          lastToElement = null
          moveIsSmart = null

          if (this.isDesktop && this.comp === 'Task')
            this.$store.commit('movingTask', true)
          
          if (!this.isDesktop)
            window.navigator.vibrate(100)
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
      if (this.isDesktop)
        obj['multiDragKey'] = 'CTRL'
      this.sortable = new Sortable(this.draggableRoot, obj)
    },
    slowlyAddItems(items) {
      return new Promise(solve => {
        this.lazyItems = []
        let i = 0
        const length = items.length

        const multiplier = this.isDesktop ? 3.5 : 5
        const timeout = length * multiplier
        
        const add = item => {
          this.lazyItems.push(item)
          if ((i + 1) !== length)
            this.lazyItemsSetTimeouts.push(setTimeout(() => {
              i++
              const t = items[i]
              if (t) add(t)
            }, multiplier))
          else solve()
        }
        const t = items[0]
        if (t) add(t)
        else solve()
      })
    },
    slowlyAddHeadings(headings) {
      return new Promise(solve => {
        this.lazyHeadings = []
        let i = 0
        const headinsgWithItems = this.showEmptyHeadings ? headings.slice() : headings.filter(h => h.items && h.items.length > 0)
        const length = headinsgWithItems.length
        let timeout = this.isDesktop ? 155 : 230

        if (length < 5 || this.viewName === 'Upcoming') timeout = 20
        
        const add = (head) => {
          this.lazyHeadings.push(head)
          if ((i + 1) !== length)
            this.lazyHeadingsSetTimeouts.push(setTimeout(() => {
              i++
              const h = headinsgWithItems[i]
              if (h) add(h)
            }, timeout))
          else solve()
        }
        const h = headinsgWithItems[0]
        if (h) add(h)
        else solve()
      })
    },
    addHeading(name, ...args) {
      if (name) {
        const i = this.getListRendererPosition()
        const ids = this.getIds(true)
        const headings = this.isRoot ? this.getHeadingsIds() : this.rootHeadings
        this.$emit('add-heading', {
          ids: ids.slice(i),
          name, index: this.headingPosition,
          headings,
        })
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
        this.$store.commit('selectTask', el.dataset.id)
        Sortable.utils.select(el)
      }
    },
    deselectAll() {
      const els = this.selectedElements
      for (const e of els)
        this.deSelectItem(e)
    },
    deSelectItem(el) {
      this.$store.commit('unselectTask', el.dataset.id)
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
      let t = this.mainFallbackItem(item, force)
      if (this.isRoot)
        t = this.rootFallbackItem(t, force)
      else t = this.headingFallbackItem(t, force)

      return t
    },
    add(item) {
      if (item.name) {
        let t = item
        if (!this.disableFallback)
          t = this.fallbackItem(item)

        let shouldRender = false
        const isNotEditingFiles = !t.handleFiles

        if (isNotEditingFiles) {
          if (this.isRoot)
            shouldRender = this.rootFilterFunction(t)
          else
            shouldRender = this.headingFilterFunction(t)
        }

        const newItemRef = this.getItemFirestoreRef()

        t = {
          ...t,
          id: newItemRef.id,
          userId: uid(),
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
        }

        const index = this.getListRendererPosition()

        if (shouldRender) {
          this.lazyItems.splice(index, 0, t)
        }

        this.addedItem = t.id
        this.addItem({
          item: t, ids: this.getIds(true),
          newId: newItemRef.id,
          index, newItemRef,
          header: this.header,
        })
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
        ids = ids.filter(id => id !== 'Edit' && id !== 'EditComp' && id !== undefined)
      return ids
    },
    contWrapper(el) {
      return el.getElementsByClassName('cont-wrapper')[0]
    },
    keydown({key}) {
      if (!this.header && this.comp !== 'List') {
        const active = document.activeElement
        const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
        if (!isTyping && !this.isOnControl) {
          if (key === 'a')
            this.addEditComp(this.lazyItems.length)
          else if (key === 'A')
            this.addEditComp(0)
          if (this.viewType === 'list') {
            if (key === 'h')
              this.addHeadingsEdit(this.lazyItems.length)
            else if (key === 'H')
              this.addHeadingsEdit(0)
          }
        }
      }
    },
    clearLazySettimeout() {
      for (const set of this.lazyItemsSetTimeouts)
        clearTimeout(set)
      for (const set of this.lazyHeadingsSetTimeouts)
        clearTimeout(set)
      this.lazyItemsSetTimeouts = []
      this.lazyHeadingsSetTimeouts = []
    },
    updateView() {
      this.changedViewName = true
      this.clearLazySettimeout()
      
      if (this.isDesktop)
        Promise.all([
          this.slowlyAddHeadings(this.headings),
          this.slowlyAddItems(this.items),
        ]).then(() => {
          this.changedViewName = false
        })
      else {
        this.lazyItems = this.items.slice()
        this.lazyHeadings = this.headings.slice()
        this.changedViewName = false
      }
    },
  },
  computed: {
    ...mapState({
      selected: state => state.selectedTasks,
      isOnControl: state => state.isOnControl,
      savedTasks: state => state.task.tasks,
      pressingKey: state => state.pressingKey,
      mainSelectionIndex: state => state.mainSelectionIndex,
      mainSelection: state => state.mainSelection,
    }),
    ...mapGetters({
      l: 'l',
      platform: 'platform',
      isDesktop: 'isDesktop',
      getTaskBodyDistance: 'task/getTaskBodyDistance',
      getTagsByName: 'tag/getTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    getMainSelectionIndex() {
      return this.isRoot ? this.mainSelectionIndex : this.lazyItems.findIndex(i => i.id === this.mainSelection)
    },
    isChangingViewName() {
      return this.changingViewName || this.rootChanging
    },
    getItems() {
      if (this.isRoot || this.showAllHeadingsItems) return this.lazyItems
      return this.showingMoreItems ? this.lazyItems : this.lazyItems.slice(0, this.hasEdit ? 4 : 3)
    },
    nonEditLazyTasks() {
      return this.lazyItems.filter(el => !el.isEdit)
    },
    computedShowSomedayButton() {
      return this.isRoot & this.showSomedayButton && this.getItems.filter(el => !el.isEdit).length > 0
    },
    showMoreItemsMessage() {
      return `${this.l['Show ']}${this.nonEditLazyTasks.length - 3} more items...`
    },
    showMoreItemsButton() {
      return !this.isRoot && !this.showAllHeadingsItems && !this.showingMoreItems && this.nonEditLazyTasks.length > 3
    },
    getHeadings() {
      return this.lazyHeadings.filter(h => {
        if (this.showHeading && this.showHeading(h)) {
          return true
        }

        return this.showEmptyHeadings || h.items.length > 0
      })
    },
    isRoot() {
      return !this.header
    },
    app() {
      return document.getElementById('app')
    },
    itemHeight() {
      return this.isDesktop ? 38 : 50
    },
    pressingMultiSelectKeys() {
      return this.pressingKey === 'Shift'
    },
    pressingSelectKeys() {
      return this.pressingKey === 'Control'
    },
    enableSelect() {
      if (this.disableSelect) return false
      return this.openCalendar || !this.isDesktop ||
      (this.pressingSelectKeys)
    },
    isSelecting() {
      if (this.selected.length > 0 || this.openCalendar) return true
      if (this.isDesktop)
        return this.pressingSelectKeys
    },
    inflate() {
      if (!((this.isRoot && this.comp === 'Task' && this.getHeadings.length === 0) || this.isLast)) return null
      return this.isRoot ? {
        minHeight: this.compHeight,
      } : {
        minHeight: '700px',
      }
    },
    draggableRoot() {
      return this.$el.getElementsByClassName('item-renderer-root')[0]
    },
    showIllustration() {
      const getHeadings = this.getHeadings
      for (const head of getHeadings)
        if (head.items.length > 0) return false
      return this.isRoot && this.lazyItems.length === 0 && getHeadings.length === 0 && this.icon && !this.header
    },
  },
  watch: {
    viewName() {
      this.deselectAll()
    },
    items(newArr) {
      if (this.waitingUpdateTimeout) {
        clearTimeout(this.waitingUpdateTimeout)
        this.waitingUpdateTimeout = null
      }
      const items = newArr.slice()
      
      this.waitingUpdateTimeout = setTimeout(() => {
        if (!this.changedViewName) {
          this.clearLazySettimeout()

          if (this.hasEdit && this.addedItem && this.edit) {
            const oldEditIndex = this.lazyItems.findIndex(el => el.isEdit)
            if (oldEditIndex > -1)
              this.lazyItems.splice(oldEditIndex, 1)
            const itemIndex = items.findIndex(el => el.id === this.addedItem)
            if (itemIndex > -1) {
              items.splice(itemIndex + 1, 0, this.edit)
            }
          }
          this.lazyItems = items
          const ts = this.lazyItems
          const removedEls = this.selectedElements.filter(el => el && !ts.find(t => t.id === el.dataset.id))
          for (const el of removedEls)
            this.deSelectItem(el)

          setTimeout(() => {
            this.focusToggle = !this.focusToggle
          })
        }
      })
    },
    headings(newArr) {
      if (this.isRoot) {
        setTimeout(() => {
          if (!this.changedViewName) {
            this.lazyHeadings = newArr.slice()
          }
        })
      }
    },
    viewName() {
      this.changingViewName = true
      setTimeout(() => this.changingViewName = false, 2000)
      
      this.numberOfTimeoutUpdates = 0
      this.updateView()

      if (this.sortable)
        this.sortable.options.disabled = this.disableSortableMount
    },
    enableSelect() {
      if (this.sortable && this.isDesktop) {
        setTimeout(() => {
          this.sortable.options.multiDrag = this.enableSelect
          if (this.isDesktop) {
            if (this.enableSelect)
              this.sortable.options.delay = 50
            else this.sortable.options.delay = 0
          }
        })
      }
    },
  }
}

</script>

<style>

.head-t-enter {
  transition-duration: 0s;
  margin: 0;
}

.head-t-enter .header-wrapper, .head-t-leave-to .header-wrapper {
  transition-duration: 0;
  height: 0 !important;
  margin: 0 !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
  opacity: 0 !important;
}

.head-t-leave-to .header-wrapper {
  transition-duration: .6s;
}

.head-t-enter-to, .head-t-leave {
  transition-duration: .6s;
  margin: 14px 0;
}

.head-t-enter-to .header-wrapper, .head-t-leave .header-wrapper {
  transition-duration: .6s;
  margin: 14px 0 !important;
  margin-bottom: 10px !important;
  height: 40px !important;
  opacity: 1 !important;
  padding: 0 6px !important;
}

</style>

<style scoped>

.illustration {
  position: absolute;
  top: 0;
  height: 100%;
  min-height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .15s;
}

.mobile .illustration {
  transform: translateX(-7px);
}

.mobile .illustration {
  width: 100%;
}

.front {
  position: relative;
  z-index: 1;
}

.ListRenderer {
  margin-top: 16px;
}

.ListRenderer.mobile {
  margin-top: 0;
}

.illus-trans-enter, .illus-trans-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.illus-trans-leave, .illus-trans-enter-to {
  opacity: 1;
  transform: translateY(0px);
}

.item-renderer-root {
  outline: none;
  position: relative;
  z-index: 2;
  overflow: visible;
  height: 100%;
}

.dontHaveItems {
  min-height: 5px;
}

</style>
