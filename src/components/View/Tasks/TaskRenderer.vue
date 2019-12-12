<template>
  <div class="TaskRenderer floating-btn-container" :class='platform' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration" class="illustration">
        <Icon :icon='icon' color='var(--appnav-color)' width="150px"/>
      </div>
    </transition>
    <div name="task-trans"
      class="front task-renderer-root"
      :class="{dontHaveTasks: getTasks.length === 0 && lazyHeadings.length === 0, showEmptyHeadings}"

      data-name='task-renderer'
    >
      <template v-for="item of getTasks">
        <Task v-if="!item.isEdit" :key="item.id" 
          v-bind="$props"

          :taskHeight='taskHeight'
          :task='item'
          :isRoot='isRoot'
          :isSelecting='isSelecting'
          :enableSelect='enableSelect'
          :multiSelectOptions='taskIconDropOptions'
          :isDragging='isDragging'
          :isScrolling='isScrolling'
          @de-select='deSelectTask'

          :data-id='item.id'
          :data-name='item.name'
          :data-type='`task`'
        />
        <TaskEdit v-else-if="item.isEdit === 'Edit'"
          :key="item.isEdit"

          v-bind='item.propsData'
          :focusToggle='focusToggle'

          :data-id='item.isEdit'

          @save='item.onSave'
          @cancel='removeEdit'
        />
        <HeadingEdit v-else
          :key="item.isEdit"

          v-bind='item.propsData'

          :data-id='item.isEdit'

          @save='item.onSave'
          @cancel='removeEdit'
        />
      </template>
    </div>
    <ButtonVue v-if="showMoreItemsButton"
      type="dark"
      :value='showMoreItemsMessage'
      @click="showingMoreItems = true"
    />
    <transition-group v-if="isRoot"
      appear
      class="front headings-root"
      name="head-t"
      tag="div"
    >
      <template v-for="(h, i) in lazyHeadings">
        <HeadingApp v-if="showEmptyHeadings || h.tasks.length > 0" :key="h.name"
          :header='h'

          :name='h.name'
          :notes='h.notes'
          :allowEdit='h.allowEdit'
          :headingEditOptions='headingEditOptions'
          :icon='h.icon'
          :progress='h.progress'
          :color='h.color ? h.color : ""'
          :options='h.options ? h.options : []'
          :save='h.onEdit'
          :movingHeading='movingHeading'

          @option-click='v => getOptionClick(h)(v)'
          @save-notes='v => getNotesOption(h)(v)'

          :data-id='h.id'
        >
          <TaskRenderer
            v-bind="{...$props, headingPosition: undefined}"

            :tasks='h.tasks'
            :headings='[]'

            :hideListName="h.hideListName"
            :headingFilterFunction='h.filterFunction'
            :headingFallbackTask='h.fallbackTask'
            :allowCalendarStr='h.calendarStr'
            :disableSortableMount='h.disableSortableMount'
            :hideFolderName="h.hideFolderName"
            :showHeadingName="h.showHeadingName"
            :onSortableAdd='h.onSortableAdd'
            @add-heading='(obj) => $emit("add-heading", obj)'
            @update="ids => updateHeadingTaskIds(h,ids)"

            :header="h"
            :addTask="h.onAddTask"
            :headingPosition='i + 1'
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

import mom from 'moment/src/moment'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  props: ['tasks', 'headings','header', 'onSortableAdd', 'viewName', 'addTask', 'viewNameValue', 'emptyIcon', 'icon', 'headingEditOptions', 'headingPosition', 'showEmptyHeadings', 'hideFolderName', 'hideListName', 'showHeadingName', 'showCompleted', 'isSmart', 'allowCalendarStr', 'updateHeadingIds',  'mainFallbackTask' ,'disableSortableMount', 'filterOptions', 'mainTasks', 'showAllHeadingsItems', 'rootFallbackTask', 'headingFallbackTask', 'rootFilterFunction', 'headingFilterFunction',
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
      changedViewName: true,
      isDragging: false,
      justScrolled: false,
      movingHeading: false,
      addedTask: null,

      hasEdit: null,
      focusToggle: false,

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
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    this.destroySortables()
    window.removeEventListener('click', this.windowClick)
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    removeEdit() {
      const i = this.lazyTasks.findIndex(el => el.isEdit)
      if (i > -1) {
        this.lazyTasks.splice(i, 1)
        this.hasEdit = false
      }
    },
    addEdit(isEdit, index, onSave, propsData) {
      this.removeEdit()
      this.lazyTasks.splice(index, 0, {
        isEdit,
        onSave,
        propsData,
      })
      this.hasEdit = true
    },
    addTaskEdit(index) {
      this.addEdit('Edit', index, this.add, {
        key: 'Edit',
        placeholder: this.l['Task name...'],
        notesPlaceholder: this.l['Notes...'], showCancel: true, btnText: this.l['Add task']
      })
    },
    addHeadingsEdit(index) {
      const h = this.headingEditOptions
      const onSave = (...args) => {
        this.addHeading(...args)
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
        direction: 'horizontal',

        forceFallback: true,
        fallbackOnBody: true,
        
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
            if (type === 'appnav-element') return true
            if (type === 'headingbutton') return true
            if (!this.onSortableAdd) return false
            if (type === 'task') return true
            if (type === 'floatbutton') return true
            if (type === 'subtask') return true
            return false
          }
        },
        delay: 100,
        touchStartThreshold: 50,
        handle: '.task-handle',

        onUpdate: (evt) => {
          setTimeout(() => {
            this.$emit('update', this.getIds(true))
          }, 100)
        },
        onSelect: evt => {
          if (this.justScrolled && !this.isDesktop)
            this.deSelectTask(evt.item)
          this.justScrolled = false
          const id = evt.item.dataset.id
          if (id !== "Edit" && !this.selected.includes(id))
            this.$store.commit('selectTask', id)
        },
        onDeselect: evt => {
          const id = evt.item.dataset.id
          this.$store.commit('unselectTask', id)
        },
        onAdd: (evt, original) => {
          const items = evt.items
          if (items.length === 0) items.push(evt.item)
          const type = items[0].dataset.type

          const ids = items.map(el => el.dataset.id)

          if (type === 'task' && this.onSortableAdd && this.sourceVueInstance) {
            const indicies = evt.newIndicies.map(el => el.index )
            if (indicies.length === 0) indicies.push(evt.newIndex)
            
            const sourceLazyTasks = this.sourceVueInstance.lazyTasks
            const destinyLazyTasks = this.lazyTasks

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
            if (type === 'floatbutton') {
              this.addTaskEdit(evt.newIndex)
            } else if (type === 'headingbutton') {
              this.addHeadingsEdit(evt.newIndex)
            }
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
            const vue = t.related.__vue__.$parent.$parent

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
            delay: 100,
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
        const timeout = length * 2.5
        const add = (task) => {
          this.lazyTasks.push(task)
          if ((i + 1) !== length)
            this.lazyTasksSetTimeouts.push(setTimeout(() => {
              i++
              const t = tasks[i]
              if (t) add(t)
            }, timeout))
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
        const length = headings.length
        let timeout = this.isDesktop ? 125 : 200
        if (length < 5 || this.viewName === 'Upcoming') timeout = 20
        const add = (head) => {
          this.lazyHeadings.push(head)
          if ((i + 1) !== length)
            this.lazyHeadingsSetTimeouts.push(setTimeout(() => {
              i++
              const h = headings[i]
              if (h) add(h)
            }, timeout))
          else solve()
        }
        const h = headings[0]
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
    addHeading(name) {
      if (name) {
        const i = this.getTaskRendererPosition()
        const ids = this.getIds(true)
        this.$emit('add-heading', {
          ids: ids.slice(i),
          name, index: this.headingPosition,
        })
      }
    },
    click(event) {
      if (this.selected.length > 0) event.stopPropagation()
    },
    deSelectTask(el) {
      Sortable.utils.deselect(el)
    },
    add(task) {
      if (task.name) {
        let t = this.mainFallbackTask(task)

        if (this.isRoot)
          t = this.rootFallbackTask(t)
        else t = this.headingFallbackTask(t)

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
        setTimeout(() => {
          this.addTask({
            task: t, ids: this.getIds(true),
            index, newTaskRef,
            header: this.header,
          })
        }, 10)
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
        if (!isTyping) {
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
    windowClick() {
      this.$store.commit('clearSelected')
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
      Promise.all([
        this.slowlyAddHeadings(this.headings),
        this.slowlyAddTasks(this.tasks),
      ]).then(() => {
        this.changedViewName = false
      })
    },
    updateLazyTasks(tasks, addedId, hasEdit) {
      if (hasEdit && addedId) {
        const taskIndex = tasks.findIndex(el => el.id === addedId)
        if (taskIndex > -1) {
          const editIndex = this.lazyTasks.findIndex(el => el.isEdit)
          if (editIndex > -1) {
            tasks.splice(taskIndex + 1, 0, this.lazyTasks[editIndex])
          }
        }
      }

      this.lazyTasks = tasks
    },
  },
  computed: {
    ...mapState({
      selected: state => state.selectedTasks,
      savedTasks: state => state.task.tasks,
      isScrolling: state => state.isScrolling,
      isOnControl: state => state.isOnControl,
    }),
    ...mapGetters({
      l: 'l',
      platform: 'platform',
      isDesktop: 'isDesktop',
      getTaskBodyDistance: 'task/getTaskBodyDistance',
      filterTasksByViewRendererFilterOptions: 'task/filterTasksByViewRendererFilterOptions',
      getTagsByName: 'tag/getTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
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
    enableSelect() {
      return !this.isDesktop ||
      (this.isOnControl || (this.selected.length > 0))
    },
    getMultiDragKey() {
      return this.selected.length > 0 ? null : 'CTRL'
    },
    draggableRoot() {
      return this.$el.getElementsByClassName('task-renderer-root')[0]
    },
    showIllustration() {
      for (const head of this.lazyHeadings)
        if (head.tasks.length > 0) return false
      return this.isRoot && this.lazyTasks.length === 0 && this.icon && !this.header
    },
    isSelecting() {
      return this.selected.length > 0
    },
  },
  watch: {
    tasks(tasks) {
      setTimeout(() => {
        if (!this.changedViewName) {
          this.clearLazySettimeout()


          this.updateLazyTasks(tasks.slice(), this.addedTask, this.hasEdit)

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
            this.lazyHeadings = newArr
          }
        })
      }
    },
    viewName() {
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
  height: 45px !important;
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
}

.dontHaveTasks {
  height: 500px;
}

.showEmptyHeadings.dontHaveTasks {
  height: 50px;
}

</style>
