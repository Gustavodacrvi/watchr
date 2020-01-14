<template>
  <div class="TaskRenderer floating-btn-container" :class='platform' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration" class="illustration">
        <Icon :icon='icon' color='var(--appnav-color)' width="150px"/>
      </div>
    </transition>
    <div
      class="front task-renderer-root"
      :class="{inflate, dontHaveTasks: lazyTasks.length === 0}"

      data-name='task-renderer'
    >
      <template v-for="item of getTasks">
        <Task v-if="!item.isEdit" :key="item.id" 
          v-bind="$props"

          :taskHeight='taskHeight'
          :task='item'
          :changingViewName='changingViewName || rootChanging'
          :isRoot='isRoot'
          :isSelecting='isSelecting'
          :multiSelectOptions='taskIconDropOptions'
          :isDragging='isDragging'
          :isScrolling='isScrolling'
          @de-select='deSelectTask'
          @select='selectTask'
          @add-task-after-selection='addTaskAfterSelection'
          @go='moveTaskHandlerSelection'
          @change-time='changeTime'

          :data-id='item.id'
          :data-name='item.name'
          :data-type='`task`'
        />
        <TaskEdit v-else-if="item.isEdit === 'Edit'"
          :key="item.isEdit"

          v-bind='item.propsData'
          :focusToggle='focusToggle'
          :fallbackTask='fallbackTask'

          :data-id='item.isEdit'

          @save='item.onSave'
          @goup='moveEdit(-1)'
          @godown='moveEdit(1)'
          @cancel='removeEdit'
        />
        <HeadingEdit v-else
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
        <div v-if="showSomedayButton && !header" @click="$emit('allow-someday')">
          <ButtonVue type="dark" :value="l['Show someday tasks...']"/>
        </div>
      </transition>
    </div>
    <ButtonVue v-if="showMoreItemsButton"
      type="dark"
      :value='showMoreItemsMessage'
      @click="showingMoreItems = true"
    />
    <transition-group v-if="isRoot"
      appear
      class="front headings-root"
      :name="headingsTrans"
      tag="div"
    >
      <template v-for="(h, i) in lazyHeadings">
        <HeadingApp v-if="renderHeading(h)" :key="h.id"
          :header='h'

          v-bind="h"

          :headingEditOptions='headingEditOptions'

          :color='h.color ? h.color : ""'
          :options='h.options ? h.options(h.nonFiltered) : []'
          :movingHeading='movingHeading'

          @option-click='v => getOptionClick(h)(v)'
          @save-notes='v => getNotesOption(h)(v)'
          :save='h.onEdit'

          :data-id='h.id'
        >
          <TaskRenderer
            v-bind="{...$props, headingPosition: undefined}"

            :tasks='h.tasks'
            :headings='[]'

            :hideListName="h.hideListName"
            :rootHeadings='getLazyHeadingsIds'
            :rootChanging='changingViewName'
            :headingFilterFunction='h.filterFunction'
            :headingFallbackTask='h.fallbackTask'
            :allowCalendarStr='h.calendarStr'
            :disableSortableMount='h.disableSortableMount'
            :hideFolderName="h.hideFolderName"
            :showHeadingName="h.showHeadingName"
            :onSortableAdd='h.onSortableAdd'
            @add-heading='(obj) => $emit("add-heading", obj)'
            @update="ids => updateHeadingTaskIds(h,ids)"
            @go='moveTaskHandlerSelection'
            @change-time='changeTime'

            :header="h"
            :addTask="h.onAddTask"
            :headingPosition='i + 1'
            :isLast='false'
          />
        </HeadingApp>
      </template>
    </transition-group>
  </div>
</template>

<script>

import Vue from 'vue'

import TaskVue from './Task.vue'
import TaskEdit from './Edit.vue'
import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import HeadingVue from './../Headings/Heading.vue'
import HeadingEdit from './../Headings/Edit.vue'
import ButtonVue from '@/components/Auth/Button.vue'


import { taskRef, serverTimestamp, uid } from '@/utils/firestore'


import Icon from '@/components/Icon.vue'

import { mapState, mapGetters } from 'vuex'

import { MultiDrag, Sortable } from 'sortablejs'

Sortable.mount(new MultiDrag())

import mom from 'moment'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  props: ['tasks', 'headings','header', 'onSortableAdd', 'viewName', 'addTask', 'viewNameValue', 'emptyIcon', 'icon', 'headingEditOptions', 'headingPosition', 'showEmptyHeadings', 'showHeading', 'hideFolderName', 'hideListName', 'showHeadingName', 'showCompleted', 'isSmart', 'allowCalendarStr', 'updateHeadingIds',  'mainFallbackTask' ,'disableSortableMount', 'filterOptions', 'mainTasks', 'showAllHeadingsItems', 'rootFallbackTask', 'headingFallbackTask', 'movingButton', 'rootFilterFunction', 'showHeadadingFloatingButton', 'headingFilterFunction', 'scheduleObject', 'isLast', 'showSomedayButton', 'openCalendar', 'rootChanging', 
  'rootHeadings', 'selectEverythingToggle',
  'viewType', 'taskIconDropOptions', 'taskCompletionCompareDate'],
  name: 'TaskRenderer',
  components: {
    Task: TaskVue, Icon, ButtonVue,
    HeadingEdit,
    HeadingApp: HeadingVue, TaskEdit,
    Illustration: IllustrationVue,
  },
  data() {
    return {
      showingMoreItems: false,
      lazyTasks: [],
      lazyTasksSetTimeouts: [],
      lazyHeadingsSetTimeouts: [],
      lazyHeadings: [],
      selectedElements: [],
      changedViewName: true,
      isDragging: false,
      justScrolled: false,
      movingHeading: false,
      waitingUpdateTimeout: null,
      changingViewName: false,

      addedTask: null,
      hasEdit: null,
      edit: null,
      focusToggle: false,
      stopRootInflation: false,

      lastSelectedId: null,
      lastHeadingName: null,
      editMoveType: 'add',

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
    changeTime(args) {
      this.$emit('change-time', args)
    },
    moveTaskHandlerSelection(bool) {
      this.$emit('go', bool)
    },
    mousemove(evt) {
      if (this.movingButton) {
        const addHeadingElement = document.querySelector('.TaskRenderer .action-heading') || {}
        const createElement = document.querySelector('.TaskRenderer .create') || {}
        const addElement = document.querySelector('.TaskRenderer .add') || {}
        const obj = {
          'action-heading': addHeadingElement.style || {},
          create: createElement.style || {},
          add: addElement.style || {},
        }
        
        const { left, width } = this.$el.getBoundingClientRect()
        const pos = (evt.pageX || evt.touches[0].pageX) - left
        
        const headingStart = width * .333333
        const addStart = this.showHeadadingFloatingButton ? width * .66666 : width * .5

        let type
        if (pos < headingStart)
          type = 'action-heading'
        else if (pos < addStart)
          type = 'create'
        else type = 'add'

        if (!this.showHeadadingFloatingButton && type === 'action-heading')
          type = 'create'

        const possibleValues = ['action-heading', 'create', 'add']

        if (!this.showHeadadingFloatingButton) {
          obj['action-heading'].flexBasis = '0px'
          obj['action-heading'].overflow = 'hidden'
        }
        const act = obj[type]
        for (const s of possibleValues)
          if (s !== type) {
            obj[s].backgroundColor = 'var(--void)'
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
    renderHeading(h) {
      if (this.showHeading && this.showHeading(h)) {
        this.stopRootInflation = true
        return true
      }

      return this.showEmptyHeadings || h.tasks.length > 0
    },
    selectMultipleIds(newId) {
      if (this.lastSelectedId && newId && this.lazyTasks.find(el => el.id === newId) && this.lazyTasks.find(el => el.id === this.lastSelectedId)) {
        const idsToSelect = []

        let selecting = false
        for (const t of this.lazyTasks) {
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
            this.selectTask(node)
          }
        }
      }
    },
    moveEdit(offset) {
      const index = this.lazyTasks.findIndex(el => el.isEdit)
      const move = () => {
        this.lazyTasks.splice(
          offset + index,
          0,
          this.lazyTasks.splice(index, 1)[0]
        )
      }
      if (offset > 0 && (offset + index) < this.lazyTasks.length)
        move()
      else if ((index + offset) > -1)
        move()
      setTimeout(() => this.focusToggle = !this.focusToggle, 10)
    },
    removeEdit() {
      const i = this.lazyTasks.findIndex(el => el.isEdit)
      if (i > -1) {
        this.lazyTasks.splice(i, 1)
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
      this.lazyTasks.splice(index, 0, edit)
      this.hasEdit = true
      this.edit = {...edit}
    },
    addTaskEdit(index) {
      this.addEdit('Edit', index, this.add, {
        key: 'Edit',
        placeholder: this.l['Task name...'],
        notesPlaceholder: this.l['Notes...'], showCancel: true, btnText: this.l['Add task']
      })
    },
    addTaskAfterSelection() {
      this.addTaskEdit(this.mainSelectionIndex + 1)
    },
    addHeadingsEdit(index) {
      const h = this.headingEditOptions
      const onSave = name => {
        this.addHeading(name)
        setTimeout(() => {
          this.removeEdit()
        }, 50)
      }
      this.addEdit('EditHeading', index, onSave, {
          key: 'EditHeading',
          errorToast: h.errorToast, names: h.excludeNames,
          buttonTxt: this.l['Save'],
        })
    },

    destroySortables() {
      if (this.sortable)
        this.sortable.destroy()
      if (this.headSort)
        this.headSort.destroy()
    },
    mountSortables() {
      let move = null
      const removeTaskOnHoverFromAppnavElements = (el) => {
        const items = document.getElementsByClassName('AppbarElement-link')
        for (const i of items) {
          if (el && i === el) continue
          i.setAttribute('id', '')
          i.style.backgroundColor = 'initial'
          i.style.boxShadow = 'initial'
          if (i.dataset.type === 'folder' || i.dataset.selectedtype === 'folder')
            i.style.color = 'var(--white)'
        }
      }
      const obj = {
        disabled: this.disableSortableMount,
        multiDrag: this.enableSelect,
        direction: 'vertical',

        forceFallback: true,
        fallbackOnBody: true,
        animation: 80,
        delay: this.isDesktop ? 0 : 100,
        handle: '.task-handle',
        
        group: {
          name: 'task-renderer',
          pull: (e,j,item) => {
            const d = item.dataset
            if (e.el.dataset.name === 'appnav-renderer') return 'clone'
            if (d.type === 'task') return true
            return false
          },
          put: (j,o,item) => {
            const d = item.dataset
            const type = d.type
            if (type === 'headingbutton' || type === 'add-task-floatbutton') return true
            if (type === 'appnav-element') return true
            if (!this.onSortableAdd) return false
            if (type === 'task') return true
            if (type === 'subtask') return true
            return false
          }
        },

        onUpdate: (evt) => {
          setTimeout(() => {
            this.$emit('update', this.getIds(true))
          }, 10)
        },
        onSelect: evt => {
          this.justScrolled = false
          const id = evt.item.dataset.id

          if (id !== "Edit" && !this.selected.includes(id)) {
            if (this.pressingSelectKeys)
              this.selectMultipleIds(id)
            this.lastSelectedId = id
            this.$store.commit('selectTask', id)
          }
        },
        onDeselect: evt => {
          const id = evt.item.dataset.id
          this.$store.commit('unselectTask', id)
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
          

          if (type === 'task' && this.onSortableAdd && this.sourceVueInstance) {
            this.removeEdit()
            this.sourceVueInstance.removeEdit()
            
            const indicies = evt.newIndicies.map(el => el.index)
            if (indicies.length === 0) indicies.push(evt.newIndex)
            
            let sourceLazyTasks = this.sourceVueInstance.lazyTasks
            let destinyLazyTasks = this.lazyTasks

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
              this.addTaskEdit(i)
            else if (this.editMoveType === 'action-heading')
              this.addHeadingsEdit(i)
            else
              this.$store.dispatch('pushPopup', {
                comp: 'FastSearch',
                payload: {
                  callback: (route, task) => {
                    this.lazyTasks.splice(i, 0, task)
                    const t = this.fallbackTask(task, true)
                    this.$store.dispatch('task/saveTask', t)
                    setTimeout(() => {
                      this.$emit('update', this.getIds(true))
                    }, 10)
                  },
                  allowed: ['tasks'],
                }
              })
          }
          for (const item of items) {
            item.remove()
          }
        },
        onStart: evt => {
          this.isDragging = true
          window.navigator.vibrate(100)
        },
        onEnd: (e, t) => {
          this.isDragging = false
          removeTaskOnHoverFromAppnavElements()
          if (move) {
            const specialTypes = ['Today', 'Completed', 'Tomorrow', 'Someday']
            if (specialTypes.includes(move.elId))
              move.type = move.elId
            this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
              elIds: [move.elId],
              taskIds: [move.taskId],
              type: move.type,
            })
          }
          move = null
        },
        onMove: (t, e) => {
          const isTaskRender = t.to.classList.contains('task-renderer-root')
          const isComingFromAnotherTaskRenderer = t.to !== this.draggableRoot
          
          if (isTaskRender && isComingFromAnotherTaskRenderer) {
            let vue = t.related.__vue__ ||
                  t.related.parentNode.__vue__
            while (true) {
              if (vue.$el.classList && vue.$el.classList.contains('TaskRenderer'))
                break
              else vue = vue.$parent
            }

            vue.sourceVueInstance = this
          } else {

            let el = e.target
  
            if (!el.classList.contains('AppbarElement-link'))
              el = el.closest('.AppbarElement-link')
            if (el) {
              const data = el.dataset
              const wrapper = el.closest('.AppbarElement')
              removeTaskOnHoverFromAppnavElements(el)
              if (wrapper && !data.disabled) {
                move = {}
                const color = data.color
                move.taskId = t.dragged.dataset.id
                move.elId = wrapper.dataset.id
                move.type = data.type
                if (move.type === 'favorite')
                  move.type = data.selectedtype
      
                // force white color, css is in AppbarElement.vu
                if (data.selectedtype !== 'folder')
                  el.setAttribute('id', 'task-on-hover')
                el.style.backgroundColor = color
                el.style.boxShadow = `0 2px 10px ${color}`
                if (data.type === 'folder' || data.selectedtype === 'folder') {
                  el.style.color = 'var(--gray)'
                }
              } else move = null
            } else move = null
            if (e && e.path && !e.path.some(el => el.classList && el.classList.contains('task-renderer-root')))
              return false
          }
        },
      }
      if (this.isDesktop)
        obj['multiDragKey'] = this.getMultiDragKey
      this.sortable = new Sortable(this.draggableRoot, obj)

      if (this.isRoot) {
        const el = this.$el.getElementsByClassName('headings-root')[0]
        if (el) {
          this.headSort = new Sortable(el, {
            disabled: !this.updateHeadingIds,
            group: 'headings',
            delay: 150,
            animation: 80,
            delayOnTouchOnly: true,
            handle: '.handle',
      
            onUpdate: (evt) => {
              const ids = this.getHeadingsIds()
              if (this.updateHeadingIds)
                this.updateHeadingIds(ids)
            },
            onStart: evt => {
              this.movingHeading = true
            },
            onEnd: evt => {
              this.movingHeading = false
            },
          })
        }
      }
    },
    slowlyAddTasks(tasks) {
      return new Promise(solve => {
        this.lazyTasks = []
        let i = 0
        const length = tasks.length

        const multiplier = this.isDesktop ? 3.5 : 5
        const timeout = length * multiplier
        
        const add = (task) => {
          this.lazyTasks.push(task)
          if ((i + 1) !== length)
            this.lazyTasksSetTimeouts.push(setTimeout(() => {
              i++
              const t = tasks[i]
              if (t) add(t)
            }, multiplier))
          else solve()
        }
        const t = tasks[0]
        if (t) add(t)
        else solve()
      })
    },
    slowlyAddHeadings(headings) {
      return new Promise(solve => {
        this.lazyHeadings = []
        let i = 0
        const headinsgWithTasks = this.showEmptyHeadings ? headings.slice() : headings.filter(h => h.tasks && h.tasks.length > 0)
        const length = headinsgWithTasks.length
        let timeout = this.isDesktop ? 155 : 230

        if (length < 5 || this.viewName === 'Upcoming') timeout = 20
        
        const add = (head) => {
          this.lazyHeadings.push(head)
          if ((i + 1) !== length)
            this.lazyHeadingsSetTimeouts.push(setTimeout(() => {
              i++
              const h = headinsgWithTasks[i]
              if (h) add(h)
            }, timeout))
          else solve()
        }
        const h = headinsgWithTasks[0]
        if (h) add(h)
        else solve()
      })
    },
    getOptionClick(h) {
      if (!h.optionClick) return () => {}
      return h.optionClick
    },
    getNotesOption(h) {
      if (!h.saveNotes) return () => {}
      return h.saveNotes
    },
    updateHeadingTaskIds(h, ids) {
      if (h.updateIds)
        h.updateIds(ids)
    },
    addHeading(name, ...args) {
      if (name) {
        const i = this.getTaskRendererPosition()
        const ids = this.getIds(true)
        this.$emit('add-heading', {
          ids: ids.slice(i),
          name, index: this.headingPosition,
          headings: this.rootHeadings,
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
    selectTask(el) {
      if (!this.selectedElements.includes(el)) {
        this.selectedElements.push(el)
        this.$store.commit('selectTask', el.dataset.id)
        Sortable.utils.select(el)
      }
    },
    deselectAll() {
      const els = this.selectedElements
      for (const e of els)
        this.deSelectTask(e)
    },
    deSelectTask(el) {
      this.$store.commit('unselectTask', el.dataset.id)
      Sortable.utils.deselect(el)

      const i = this.selectedElements.findIndex(el => el === el)
      if (i > -1)
        this.selectedElements.splice(i, 1)
    },
    windowClick() {
      for (const el of this.selectedElements)
        if (this.lazyTasks.find(t => t.id === el.dataset.id))
          this.deSelectTask(el)
      this.$store.commit('clearSelected')
    },
    fallbackTask(task, force) {
      let t = this.mainFallbackTask(task, force)

      if (this.isRoot)
        t = this.rootFallbackTask(t, force)
      else t = this.headingFallbackTask(t, force)

      return t
    },
    add(task) {
      if (task.name) {
        let t = this.fallbackTask(task)

        let shouldRender = false
        const isNotEditingFiles = !t.handleFiles

        if (isNotEditingFiles) {
          if (this.isRoot)
            shouldRender = this.rootFilterFunction(t)
          else
            shouldRender = this.headingFilterFunction(t)
        }

        const newTaskRef = taskRef()

        t = {
          ...t,
          id: newTaskRef.id,
          userId: uid(),
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
        }

        const index = this.getTaskRendererPosition()

        if (shouldRender) {
          this.lazyTasks.splice(index, 0, t)
        }

        this.addedTask = t.id
        this.addTask({
          task: t, ids: this.getIds(true),
          index, newTaskRef,
          header: this.header,
        })
      }
    },
    getTaskRendererPosition() {
      return this.lazyTasks.findIndex(el => el.isEdit)
    },
    moveTaskRenderer(dire) {
      const i = this.getTaskRendererPosition()
      const childNodes = this.draggableRoot.childNodes
      const adder = childNodes[i]
      let element = null
      if (dire === 'up')
        element = childNodes[i - 1]
      else element = childNodes[i + 1]
      if (element && adder) {
        if (dire === 'up')
          this.draggableRoot.insertBefore(adder, element)
        else
          this.draggableRoot.insertBefore(element, adder)
        const input = adder.getElementsByClassName('input')[0]
        if (input) input.focus()
      }
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
    },
    getIds(removeAdders) {
      const childs = this.draggableRoot.childNodes
      let ids = []
      for (const el of childs)
        if (el.dataset)
          ids.push(el.dataset.id)
      if (removeAdders)
        ids = ids.filter(id => id !== 'Edit' && id !== 'EditHeading' && id !== undefined)
      return ids
    },
    contWrapper(el) {
      return el.getElementsByClassName('cont-wrapper')[0]
    },
    keydown({key}) {
      if (!this.header) {
        const active = document.activeElement
        const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
        if (!isTyping && !this.isOnControl) {
          if (key === 'a')
            this.addTaskEdit(this.lazyTasks.length)
          else if (key === 'A')
            this.addTaskEdit(0)
          if (this.viewType === 'list') {
            if (key === 'h')
              this.addHeadingsEdit(this.lazyHeadings.length)
            else if (key === 'H')
              this.addHeadingsEdit(0)
          }
        }
      }
    },
    clearLazySettimeout() {
      for (const set of this.lazyTasksSetTimeouts)
        clearTimeout(set)
      for (const set of this.lazyHeadingsSetTimeouts)
        clearTimeout(set)
      this.lazyTasksSetTimeouts = []
      this.lazyHeadingsSetTimeouts = []
    },
    updateView() {
      this.changedViewName = true
      this.clearLazySettimeout()
      
      if (this.isDesktop)
        Promise.all([
          this.slowlyAddHeadings(this.headings),
          this.slowlyAddTasks(this.tasks),
        ]).then(() => {
          this.changedViewName = false
        })
      else {
        this.lazyTasks = this.tasks.slice()
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
      isScrolling: state => state.isScrolling,
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
    getLazyHeadingsIds() {
      return this.lazyHeadings.map(el => el.id)
    },
    headingsTrans() {
      if (this.isDesktop) return 'head-t'
      return (this.changingViewName || this.rootChanging) ? '' : 'head-t'
    },
    inflate() {
      if (this.stopRootInflation) return false
      const hasHeadings = this.lazyHeadings.length > 0
      
      return (this.isRoot && !hasHeadings || (this.isRoot && hasHeadings && this.lazyHeadings.every(h => h.tasks.length === 0) && !this.showEmptyHeadings)) || this.isLast
    },
    getTasks() {
      if (this.isRoot || this.showAllHeadingsItems) return this.lazyTasks
      return this.showingMoreItems ? this.lazyTasks : this.lazyTasks.slice(0, 3)
    },
    showMoreItemsMessage() {
      return `${this.l['Show ']}${this.lazyTasks.length - 3}${this.l[' more tasks...']}`
    },
    showMoreItemsButton() {
      return !this.isRoot && !this.showAllHeadingsItems && !this.showingMoreItems && this.lazyTasks.length > 3
    },
    isRoot() {
      return !this.header
    },
    app() {
      return document.getElementById('app')
    },
    taskHeight() {
      return this.isDesktop ? 38 : 50
    },
    pressingSelectKeys() {
      const pressingKey = this.pressingKey
      return pressingKey === 'Control' || pressingKey === 'Shift'
    },
    enableSelect() {
      return this.openCalendar || !this.isDesktop ||
      (this.pressingSelectKeys || (this.selected.length > 0))
    },
    getMultiDragKey() {
      return (this.openCalendar || this.selected.length > 0) ? null : 'CTRL'
    },
    isSelecting() {
      if (this.selected.length > 0 || this.openCalendar) return true
      if (this.isDesktop)
        return this.pressingSelectKeys
    },
    draggableRoot() {
      return this.$el.getElementsByClassName('task-renderer-root')[0]
    },
    showIllustration() {
      const lazyHeadings = this.lazyHeadings
      for (const head of lazyHeadings)
        if (head.tasks.length > 0) return false
      return this.isRoot && this.lazyTasks.length === 0 && this.icon && !this.header
    },
  },
  watch: {
    viewName() {
      this.deselectAll()
    },
    tasks(newArr) {
      if (this.waitingUpdateTimeout) {
        clearTimeout(this.waitingUpdateTimeout)
        this.waitingUpdateTimeout = null
      }
      const tasks = newArr.slice()
      
      this.waitingUpdateTimeout = setTimeout(() => {
        if (!this.changedViewName) {
          this.clearLazySettimeout()

          if (this.hasEdit && this.addedTask && this.edit) {
            const oldEditIndex = this.lazyTasks.findIndex(el => el.isEdit)
            if (oldEditIndex > -1)
              this.lazyTasks.splice(oldEditIndex, 1)
            const taskIndex = tasks.findIndex(el => el.id === this.addedTask)
            if (taskIndex > -1) {
              tasks.splice(taskIndex + 1, 0, this.edit)
            }
          }
          this.lazyTasks = tasks
          const ts = this.lazyTasks
          const removedEls = this.selectedElements.filter(el => el && !ts.find(t => t.id === el.dataset.id))
          for (const el of removedEls)
            this.deSelectTask(el)

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
      if (this.headSort)
        this.headSort.options.disabled = !this.updateHeadingIds
    },
    updateHeadingIds() {
      if (this.headSort)
        this.headSort.options.disabled = !this.updateHeadingIds
    },
    filterOptions() {
      headingsFilterCache = {}
    },
    enableSelect() {
      if (this.sortable) {
        this.sortable.options.multiDrag = this.enableSelect
        this.sortable.options.multiDragKey = this.getMultiDragKey
        if (this.isDesktop) {
          if (this.enableSelect)
            this.sortable.options.delay = 50
          else this.sortable.options.delay = 0
        }
      }
    },
    isScrolling() {
      if (this.isScrolling) this.justScrolled = true
      else setTimeout(() => this.justScrolled = false, 500)
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
  position: fixed;
  top: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .15s;
}

.desktop .illustration {
  transform: translateX(300px);
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

.TaskRenderer {
  position: relative;
  margin-top: 16px;
}

.TaskRenderer.mobile {
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

.task-renderer-root {
  outline: none;
  position: relative;
  z-index: 2;
  overflow: visible;
  height: 100%;
}

.dontHaveTasks {
  min-height: 5px;
}

.inflate {
  min-height: 1200px;
}

</style>
