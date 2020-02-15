<template>
  <div class="ListRenderer floating-btn-container" :class='[platform, `${comp}-ListRenderer`, {isHeading: !isRoot}]' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration"
        class="illustration"
        :style="{
          width: `calc(100% - ${width}px)`,
          left: width + 'px',
        }"
      >
        <Icon :icon='icon' color='var(--sidebar-color)' width="150px"/>
      </div>
    </transition>
    <div
      class="front item-renderer-root"
      :class="{dontHaveItems: lazyItems.length === 0, isRootAndHaveItems: isRoot && lazyItems.length > 0}"
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
          :comp='comp'
          :movingItem='movingItem'
          :waitForAnotherItemComplete='waitForAnotherTaskCompleteAnimation'

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
      <div v-if="showAddItemButton"
        class="add-item-wrapper"
      >
        <div
          class="add-item rb"
          @click="addEditComp(nonEditGetItems.length)"
        >
          Add item
        </div>
      </div>
      <div v-if="isDesktop && viewType === 'list' && !isSmart"
        class="heading-add"
        @click.stop="addHeadingsEdit(lazyItems.length)"
      >
        <span class="heading-add-line"></span>
        <span class="heading-add-message">
          Add heading
        </span>
      </div>
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
      :disableSortableMount='disableSortableMount'
      :onAddExistingItem='onAddExistingItem'
      :isRootAddingHeadings='isAddingHeadings'
      :getItemFirestoreRef='getItemFirestoreRef'
      :showHeadingFloatingButton='showHeadingFloatingButton'
      :justAddedHeading='justAddedHeading'
      :updateHeadingIds='updateHeadingIds'
      :itemPlaceholder='itemPlaceholder'
      :disableFallback='disableFallback'

      @change-time='changeTime'
      @added-heading-complete-mount='justAddedHeading = null'
      @go='moveItemHandlerSelection'
      @add-heading='addHeadingFromRootHeadings'
      @headings-items-ids='getHeadingsItemsIds'
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
  props: ['items', 'headings','header', 'onSortableAdd', 'viewName', 'addItem', 'viewNameValue', 'icon', 'headingEditOptions', 'headingPosition', 'showEmptyHeadings', 'showHeading', 'hideFolderName', 'hideListName', 'hideGroupName', 'showHeadingName', 'isSmart', 'allowCalendarStr', 'updateHeadingIds',  'mainFallbackItem' ,'disableSortableMount', 'showAllHeadingsItems', 'rootFallbackItem', 'headingFallbackItem', 'addedHeading', 'rootFilterFunction', 'isRootAddingHeadings', 
  'disableFloatingButton', 'showHeadingFloatingButton', 'headingFilterFunction', 'scheduleObject', 'showSomedayButton', 'openCalendar', 'rootChanging', 'width',
  'rootHeadings', 'selectEverythingToggle', 'viewType', 'itemIconDropOptions', 'itemCompletionCompareDate', 'comp', 'editComp', 'itemPlaceholder', 'getItemFirestoreRef', 'onAddExistingItem', 'disableSelect', 'group',
   'disableFallback', 'isLast', 'getCalendarOrderDate'],
  components: {
    Task, ButtonVue, List, ListEdit,
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
      movingItem: false,

      lastSelectedId: null,
      lastHeadingName: null,
      lastButtonElement: null,
      editMoveType: 'add',
      headingsItemsIds: [],

      isAboutToMoveBetweenSortables: false,
      sourceVueInstance: null,
      justAddedHeading: false,
      isAddingHeadings: false,

      completeAnimationStack: [],
      completeAnimationSettimeout: null,
    }
  },
  created() {
    if (!this.isRoot)
      this.changedViewName = false
    this.updateView()
  },
  mounted() {
    if (this.header && this.header.name === this.addedHeading) {
      this.addEditComp(0)
      this.$emit('added-heading-complete-mount')
    }
    this.mountSortables()
    window.addEventListener('click', this.windowClick)
    window.addEventListener('touchmove', this.mousemove)
    if (this.isDesktop) {
      window.addEventListener('keydown', this.keydown)
      window.addEventListener('mousemove', this.mousemove)
    }

    this.emitIds()
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
    waitForAnotherTaskCompleteAnimation(hideTaskFunc) {
      this.completeAnimationStack.push(hideTaskFunc)

      if (this.completeAnimationSettimeout)
        clearTimeout(this.completeAnimationSettimeout)
      
      this.completeAnimationSettimeout = setTimeout(() => {
        for (const animate of this.completeAnimationStack)
          animate()
        this.completeAnimationStack = []
      }, 2250)
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
    changeTime(args) {
      this.$emit('change-time', args)
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
            obj[s].backgroundColor = 'var(--sidebar-color)'
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
      let divs = []
      let lastToElement = null

      const onMove = () => divs = []
      
      const obj = {
        disabled: this.disableSortableMount,
        multiDrag: this.enableSelect || !this.isDesktop,
        direction: 'vertical',

        forceFallback: true,
        fallbackOnBody: true,
        animation: 80,
        delay: this.isDesktop ? 25 : 100,
        handle: '.item-handle',
        
        group: this.group || {
          name: 'item-renderer',
          pull: (e,j,item) => {
            const d = item.dataset
            if (e.el.dataset.name === 'sidebar-renderer') return true
            if (e.el.dataset.name === 'folders-root') return true
            if (d.type === 'Task' && this.comp === "Task") return true
            if (d.type === 'List' && this.comp === 'List') return true
            return false
          },
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'headingbutton' || type === 'add-task-floatbutton') return !this.disableFloatingButton
            if (type === 'sidebar-element') return true
            if (!this.onSortableAdd) return false
            if (type === 'Task' && this.comp === "Task") return true
            if (type === 'List' && this.comp === 'List') return true
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
          const items = evt.items
          if (items.length === 0) items.push(evt.item)
          const type = items[0].dataset.type
          const indicies = evt.oldIndicies.map(el => el.index)
          if (indicies.length === 0) indicies.push(evt.oldIndex)
          const root = this.draggableRoot
          
          for (let i = 0; i < indicies.length;i++) {
            const s = items[i].style
            s.transitionDuration = 0
            s.height = '0px'
            s.overflow = 'hidden'
            root.insertBefore(items[i], root.children[indicies[i]])
          }

          items.forEach(this.deSelectItem)
        },
        onAdd: (evt, original) => {
          const items = evt.items
          if (items.length === 0) items.push(evt.item)
          const type = items[0].dataset.type
          for (let i = 0; i < items.length;i++) {
            const s = items[i].style
            s.transitionDuration = 0
            s.height = '0px'
            s.overflow = 'hidden'
            items[i].remove()
          }

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
          
          if ((type === 'Task' || type === 'List') && this.comp === 'List') {
            const finalIds = this.lazyItems.map(el => el.id)
            finalIds.splice(indicies[0], 0, ...ids)
            this.onSortableAdd(items, ids, indicies, finalIds)
          } else if (type === 'Task' && this.onSortableAdd && this.sourceVueInstance) {
            this.removeEdit()
            this.sourceVueInstance.removeEdit()

            let sourceLazyTasks = this.sourceVueInstance.lazyItems
            const newItems = this.lazyItems

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
              newItems.splice(indicies[i], 0, tasks[i])
            }

            setTimeout(() => {
              this.onSortableAdd(evt, ids, type, this.lazyItems.map(el => el.id))
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
                  divs.push(target)
                  
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
            cancelTimeout = setTimeout(() => cancel = true, 70)
            
            return false
          }
        },
        onEnd: evt => {
          this.$store.commit('moving', false)
          
          if (this.isDesktop)
            window.removeEventListener('mousemove', onMove)
          
          if (!cancel) {
            const handle = obj => this.$store.dispatch('task/handleTasksBySidebarElementDragAndDrop', obj)

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
          
          if (this.isDesktop && this.comp === 'Task') {
            this.movingItem = false
            this.$store.commit('movingTask', false)
          }
        },
        onStart: evt => {
          this.$store.commit('moving', true)
          
          if (this.isDesktop)
            window.addEventListener('mousemove', onMove)
          
          cancel = true
          divs = []
          lastToElement = null
          moveIsSmart = null

          if (this.isDesktop && this.comp === 'Task') {
            this.movingItem = true
            this.$store.commit('movingTask', true)
          }
          
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

        const multiplier = this.isDesktop ? 1.5 : 5
        const timeout = length * multiplier
        
        const add = item => {
          this.lazyItems.push(item)
          if ((i + 1) !== length)
            this.lazyItemsSetTimeouts.push(setTimeout(() => {
              i++
              const t = items[i]
              if (t) add(t)
            }, timeout))
          else solve()
        }
        const t = items[0]
        if (t) add(t)
        else solve()
      })
    },
    slowlyAddHeadings(headings) {
      return new Promise(solve => {
        this.isAddingHeadings = true
        this.lazyHeadings = []
        let i = 0
        const headinsgWithItems = this.showEmptyHeadings ? headings.slice() : headings.filter(h => h.items && h.items.length > 0)
        const length = headinsgWithItems.length
        let timeout = this.isDesktop ? 80 : 230

        if (length < 5 || this.viewName === 'Upcoming') timeout = 175
        
        const add = (head) => {
          this.lazyHeadings.push(head)
          if ((i + 1) !== length)
            this.lazyHeadingsSetTimeouts.push(setTimeout(() => {
              i++
              const h = headinsgWithItems[i]
              if (h) add(h)
            }, timeout))
          else {
            this.isAddingHeadings = false
            solve()
          }
        }
        const h = headinsgWithItems[0]
        if (h) add(h)
        else {
          this.isAddingHeadings = false 
          solve()
        }
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
        if (this.isRoot)
          this.justAddedHeading = name
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
      let t = this.mainFallbackItem(item, force)
      if (this.isRoot)
        t = this.rootFallbackItem(t, force)
      else t = this.headingFallbackItem(t, force)

      return t
    },
    add(item, targetIndex, forceFallback) {
      if (item.name) {
        let t = item
        if (!this.disableFallback)
          t = this.fallbackItem(item, forceFallback)

        let shouldRender = false
        const isNotEditingFiles = !t.handleFiles

        if (isNotEditingFiles) {
          if (this.isRoot)
            shouldRender = this.rootFilterFunction(t)
          else
            shouldRender = this.headingFilterFunction(t)
        }

        const newItemRef = this.getItemFirestoreRef(this.header)

        t = {
          ...t,
          id: newItemRef.id,
          userId: uid(),
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
        }

        const index = targetIndex || this.getListRendererPosition()

        if (shouldRender) {
          this.lazyItems.splice(index, 0, t)
        }

        this.addedItem = t.id
        this.addItem({
          item: t, ids: this.getIds(true),
          newId: t.id,
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
          if (!this.disableFloatingButton) {
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
      selected: state => state.selectedItems,
      isOnControl: state => state.isOnControl,
      selectedType: state => state.selectedType,
      isOnShift: state => state.isOnShift,
      pressingKey: state => state.pressingKey,
      mainSelection: state => state.mainSelection,
      toggleClipboardPaste: state => state.toggleClipboardPaste,

      moving: state => state.moving,
    }),
    ...mapGetters({
      savedTasks: 'task/tasks',
      platform: 'platform',
      isDesktop: 'isDesktop',
      getTaskBodyDistance: 'task/getTaskBodyDistance',
      getTagsByName: 'tag/getTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    showAddItemButton() {
      return this.isDesktop && !this.hasEdit && !this.moving && !this.disableFloatingButton && !this.disableSortableMount
    },
    allItemsIds() {
      if (!this.isRoot)
        return this.getItems.map(el => el.id)
      return [...this.getItems.map(el => el.id), ...this.headingsItemsIds].flat()
    },
    getMainSelectionIndex() {
      return this.lazyItems.findIndex(i => i.id === this.mainSelection)
    },
    isChangingViewName() {
      return this.changingViewName || this.rootChanging
    },
    getItems() {
      if (this.isRoot || this.showAllHeadingsItems) return this.lazyItems
      return this.showingMoreItems ? this.lazyItems : this.lazyItems.slice(0, this.hasEdit ? 4 : 3)
    },
    nonEditGetItems() {
      return this.getItems.filter(el => !el.isEdit)
    },
    nonEditLazyTasks() {
      return this.lazyItems.filter(el => !el.isEdit)
    },
    computedShowSomedayButton() {
      return this.isRoot & this.showSomedayButton && this.getItems.filter(el => !el.isEdit).length > 0
    },
    showMoreItemsMessage() {
      return `Show ${this.nonEditLazyTasks.length - 3} more items...`
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
      return this.isOnShift
    },
    pressingSelectKeys() {
      return this.isOnControl
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
      if ((this.isRoot && this.comp === "Task" && this.getHeadings.length === 0) || (this.isLast && !this.isRootAddingHeadings))
        return {
          minHeight: '700px',
        }
      return null
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
    items(newArr) {
      if (this.waitingUpdateTimeout) {
        clearTimeout(this.waitingUpdateTimeout)
        this.waitingUpdateTimeout = null
      }
      const items = newArr.slice()
      const isSmartListHeading = this.isSmart && !this.isRoot && this.viewType === 'list'
      
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
      }, isSmartListHeading ? 200 : 0)
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
    getCalendarOrderDate() {
      this.changingViewName = true
      setTimeout(() => this.changingViewName = false, 2000)
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
  transition-duration: .2s;
}

.heading-add {
  position: relative;
  transform: translateY(25px);
  display: flex;
  justify-content: center;
  opacity: 0;
  transition-duration: .2s;
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
  height: 35px;
  position: relative;
}

.add-item {
  background-color: var(--sidebar-color);
  height: 0;
  opacity: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .2s;
  transform: scale(1,1);
}

.add-item-wrapper:hover .add-item {
  height: 35px;
  opacity: 1;
  cursor: pointer;
  outline: none;
}

.add-item-wrapper:active .add-item {
  transform: scale(.95,.95);
}

.dontHaveItems {
  min-height: 35px;
}

.isRootAndHaveItems {
  margin: 40px 0;
}

.mobile .isRootAndHaveItems {
  margin: 25px 0;
}


</style>
