<template>
  <div class="TaskRenderer floating-btn-container" :class='platform' @click='click'>
    <transition name="illus-trans" appear>
      <div v-if="showIllustration" class="illustration">
        <Icon :icon='illustration' color='var(--appnav-color)' width="150px"/>
      </div>
    </transition>
    <transition-group name="task-trans" class="front task-renderer-root" :class="{dontHaveTasks: tasks.length === 0 && headings.length === 0, showEmptyHeadings}"
      appear
      tag="div"
      @enter="enter"
      @leave="leave"
      data-name='task-renderer'
    >
      <Task v-for="item of lazyTasks" :key="item.id" 
        v-bind="$props"

        :taskHeight='taskHeight'
        :task='item'
        :isSelecting='isSelecting'
        :enableSelect='enableSelect'
        :multiSelectOptions='options'
        :isDragging='isDragging'
        :isScrolling='isScrolling'
        @de-select='deSelectTask'

        :data-id='item.id'
        :data-type='`task`'
      />
    </transition-group>
    <transition-group
      appear
      class="front headings-root"
      @leave='headingsLeave'
      @enter='headingsEnter'
      tag="div"
    >
      <template v-for="(h, i) in lazyHeadings">
        <HeadingApp v-if="showEmptyHeadings || filter(h).length > 0" :key="h.id"
          :header='h'

          :name='h.name'
          :notes='h.notes'
          :allowEdit='h.allowEdit'
          :headingEdit='headingEdit'
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

            :tasks='filter(h)'
            :hideListName="h.hideListName"
            :allowCalendarStr='h.calendarStr'
            :hideFolderName="h.hideFolderName"
            :showHeadingName="h.showHeadingName"
            :onSortableAdd='h.onSortableAdd'
            @add-heading='(obj) => $emit("add-heading", obj)'
            @update="ids => updateHeadingIds(h,ids)"

            :headings='[]'
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
import TaskEditTemplate from './Edit.vue'
import IllustrationVue from '@/components/Illustrations/Illustration.vue'
import HeadingVue from './../Headings/Heading.vue'
import HeadingEditVue from './../Headings/Edit.vue'

import Icon from '@/components/Icon.vue'

import { mapState, mapGetters } from 'vuex'

import { MultiDrag, Sortable } from 'sortablejs'

Sortable.mount(new MultiDrag())

import mom from 'moment/src/moment'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

export default {
  props: ['tasks', 'headings','header', 'onSortableAdd', 'viewName', 'addTask', 'viewNameValue', 'emptyIcon', 'illustration', 'activeTags', 'headingEdit', 'headingPosition', 'showEmptyHeadings', 'hideFolderName', 'hideListName', 'showHeadingName', 'showCompleted', 'activeList', 'isSmart',
  'viewType', 'options', 'taskCompletionCompareDate'],
  name: 'TaskRenderer',
  components: {
    Task: TaskVue, Icon,
    HeadingApp: HeadingVue,
    Illustration: IllustrationVue,
  },
  data() {
    return {
      lazyTasks: [],
      lazyTasksSetTimeouts: [],
      lazyHeadingsSetTimeouts: [],
      lazyHeadings: [],
      changedViewName: true,
      addedTask: false,
      atLeastOneRenderedTask: false,
      isDragging: false,
      justScrolled: false,
      movingHeading: false,
      headSort: null,
      sortable: null,
    }
  },
  created() {
    if (!this.isRoot)
      this.changedViewName = false
    this.updateView()
  },
  mounted() {
    let move = null
    const removeTaskOnHoverFromAppnavElements = (el) => {
      const items = document.getElementsByClassName('AppbarElement-link')
      for (const i of items) {
        if (el && i === el) continue
        i.setAttribute('id', '')
        i.style.backgroundColor = 'initial'
        i.style.boxShadow = 'initial'
        if (i.dataset.type === 'folder')
          i.style.color = 'var(--white)'
      }
    }
    const obj = {
      multiDrag: this.enableSelect,
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
          if (d.type === 'task') return true
          if (d.type === 'floatbutton') return true
          if (d.type === 'subtask') return true
          if (d.type === 'appnav-element') return true
          if (d.type === 'headingbutton') return true
          return false
        }
      },
      delay: 150,
      delayOnTouchOnly: true,
      handle: '.handle',

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
      onAdd: (evt) => {
        const items = evt.items
        if (items.length === 0) items.push(evt.item)
        const type = items[0].dataset.type

        const addEdit = (comp, onSave, propsData) => {
          const Constructor = Vue.extend(comp)
          const instance = new Constructor({
            parent: this,
            propsData,
          })
          const el = this.$el.querySelector('.action-button')
          el.setAttribute('id', 'edit-task-renderer')
          instance.$mount('#edit-task-renderer')
          this.$el.getElementsByClassName('Edit')[0].setAttribute('data-id', 'Edit')
          this.applyEventListenersToEditVueInstance(instance, onSave, evt)
        }
        
        if (type !== 'addtask')
          for (const item of items)
            item.style.display = 'none'
        if (type === 'task' && this.onSortableAdd)
          this.onSortableAdd(evt, items.map(el => el.dataset.id), type, this.getIds(true))
        if (type === 'floatbutton') {
          addEdit(TaskEditTemplate, this.add, {
              key: 'Edit',
              placeholder: this.l['Task name...'],
              notesPlaceholder: this.l['Notes...'], showCancel: true, btnText: this.l['Add task']
            })
        } else if (type === 'headingbutton') {
          const h = this.headingEdit
          addEdit(HeadingEditVue, this.addHeading, {
              key: 'EditHeading',
              errorToast: h.errorToast, names: h.excludeNames,
              buttonTxt: this.l['Save'],
            })
        }
      },
      onStart: (evt) => {
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
  
            el.setAttribute('id', 'task-on-hover')
            el.style.backgroundColor = color
            el.style.boxShadow = `0 2px 10px ${color}`
            if (data.type === 'folder')
              el.style.color = 'var(--gray)'
          } else move = null
        } else move = null
        if (e && e.path && !e.path.some(el => el.classList && el.classList.contains('task-renderer-root')))
          return false
      },
    }
    if (this.isDesktop)
      obj['multiDragKey'] = this.getMultiDragKey
    this.sortable = new Sortable(this.draggableRoot, obj)
    const el = this.$el.getElementsByClassName('headings-root')[0]
    if (el) {
      this.headSort = new Sortable(el, {
        group: 'headings',
        delay: 225,
        delayOnTouchOnly: true,
        handle: '.handle',
  
        onUpdate: (evt) => {
          const ids = this.getHeadingsIds()
          this.$emit('update-headings', ids)
        },
        onStart: evt => {
          this.movingHeading = true
        },
        onEnd: evt => {
          this.movingHeading = false
        },
      })
    }
    window.addEventListener('click', this.windowClick)
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    this.sortable.destroy()
    this.headSort.destroy()
    window.removeEventListener('click', this.windowClick)
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    slowlyAddTasks(tasks) {
      return new Promise(solve => {
        this.lazyTasks = []
        let i = 0
        const length = tasks.length
        const timeout = length / 5
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
        let timeout = length * 30
        if (length < 10) timeout = 50
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
    applyEventListenersToEditVueInstance(ins, onSave, evt) {
      const el =this.$el.getElementsByClassName('Edit')[0]
      if (el) {
        el.setAttribute('data-id', 'Edit')
        ins.$on('save', (obj) => onSave(obj, evt))
        ins.$on('goup', () => this.moveTaskRenderer('up'))
        ins.$on('godown', () => this.moveTaskRenderer('down'))
        ins.$on('cancel', () => {
          ins.$destroy()
          const $el = ins.$el
          $el.parentNode.removeChild($el)
        })
      }
    },
    updateHeadingIds(h, ids) {
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
    hideHeading(s) {
      s.height = '0px'
      s.margin = 0
      s.padding = 0
      s.marginBottom = '0px'
      s.opacity = 0
      s.borderBottom = 'none'
    },
    showHeading(s) {
      s.height = '45px'
      s.opacity = 1
      s.marginBottom = '10px'
      s.padding = '0 6px'
      s.borderBottom = '1px solid var(--light-gray)'
    },
    headingsLeave(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      const root = el.getElementsByClassName('task-renderer-root')[0]
      const TaskRenderer = el.getElementsByClassName('TaskRenderer')[0]
      if (header) {
        const divMargin = el.getElementsByClassName('dontHaveTasks')[0]
        const s = header.style
        if (divMargin) {
          divMargin.style.transitionDuration = '.15s'
          divMargin.style.height = 0
        }
        const sw = el.style

        if (root) {
          root.style.transitionDuration = '0s'
          root.style.height = root.offsetHeight + 'px'
        }
        s.transitionDuration = '0s'
        sw.transitionDuration = '0s'
        sw.margin = '24px 0'
        this.showHeading(s)
        setTimeout(() => {
          if (root) {
            root.style.transitionDuration = '.15s'
            root.style.height = '0px'
            root.style.opacity = 0
          }
          TaskRenderer.style.transitionDuration = '.15s'
          TaskRenderer.style.margin = 0
          header.style.transitionDuration = '.15s'
          header.style.margin = 0
          s.transitionDuration = '.15s'
          sw.transitionDuration = '.15s'
          sw.margin = 0
          this.hideHeading(s)
        })
      }
    },
    headingsEnter(el) {
      const header = el.getElementsByClassName('header-wrapper')[0]
      if (header) {
        const s = header.style
        const sw = el.style
        s.transitionDuration = '0s'
        sw.transitionDuration = '0s'
        sw.margin = 0
        this.hideHeading(s)
        setTimeout(() => {
          s.transitionDuration = '.15s'
          sw.transitionDuration = '.15s'
          sw.margin = '24px 0'
          this.showHeading(s)
        })
      }
    },
    deSelectTask(el) {
      Sortable.utils.deselect(el)
    },
    add(task) {
      if (task.name) {
        this.addTask({
          task, ids: this.getIds(true),
          index: this.getTaskRendererPosition(),
          header: this.header,
        })
        this.addedTask = true
      }
    },
    getTaskRendererPosition() {
      const ids = this.getIds()
      for (let i = 0;i < ids.length;i++) {
        if (ids[i] === 'Edit')
          return i
      }
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
        ids = ids.filter(id => id !== 'Edit' && id !== undefined)
      return ids
    },
    contWrapper(el) {
      return el.getElementsByClassName('cont-wrapper')[0]
    },
    fixTaskRenderer() {
      setTimeout(() => {
        const i = this.getTaskRendererPosition()
        const childNodes = this.draggableRoot.childNodes
        const adder = childNodes[i]
        const newTask = childNodes[i + 1]
        if (newTask)
          this.draggableRoot.insertBefore(newTask, adder)
        this.addedTask = false
      }, 10)
    },
    enter(el) {
      if (this.addedTask)
        this.fixTaskRenderer()
      const cont = this.contWrapper(el)
      if (cont) {
        const s = cont.style
        cont.classList.add('hided')
        s.height = '0px'
        s.padding = '2px 0'
        setTimeout(() => {
          s.transition = 'height .15s, opacity .15s, transform .1s !important'
          cont.classList.add('show')
          s.height = this.taskHeight + 'px'
          s.padding = '0'
          cont.classList.remove('hided')
        }, 50)
      }
    },
    leave(el) {
      const cont = el.getElementsByClassName('cont-wrapper')[0]
      if (cont) {
        cont.classList.add('hided-leave')
        cont.style.height = 0
      }
    },
    keydown({key}) {
      if (!this.header) {
        const addEdit = (comp, propsData, onSave, pos) => {
          const Constructor = Vue.extend(comp)
          const instance = new Constructor({
            parent: this,
            propsData,
          })
          const node = document.createElement('div')
          node.setAttribute('id', 'edit-task-renderer')
          if (pos === 'begin') {
            const child = this.draggableRoot.childNodes[0]
            if (child)
              child.prepend(node)
            else this.draggableRoot.appendChild(node)
          } else if (pos === 'end') {
            this.draggableRoot.appendChild(node)
          }
          instance.$mount('#edit-task-renderer')
          this.applyEventListenersToEditVueInstance(instance, onSave) 
        }

        const addTaskEdit = pos => addEdit(TaskEditTemplate, {
          key: 'Edit',
          placeholder: this.l['Task name...'],
          notesPlaceholder: this.l['Notes...'], showCancel: true, btnText: this.l['Add task']
        }, this.add, pos)
        const h = this.headingEdit
        const addHeadingEdit = (pos) => addEdit(HeadingEditVue, {
          key: 'EditHeading',
          errorToast: h.errorToast, names: h.excludeNames,
          buttonTxt: this.l['Save'],
        }, this.addHeading, pos)

        const active = document.activeElement
        const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
        if (!isTyping) {
          if (key === 'a')
            addTaskEdit('end')
          else if (key === 'A')
            addTaskEdit('begin')
          if (this.viewType === 'list') {
            if (key === 'h')
              addHeadingEdit('end')
            else if (key === 'H')
              addHeadingEdit('begin')
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
    removeRepeated(newArr) {
      return this.$worker.run((newArr) => {
        const unique = []
        const set = new Set()
        for (const t of newArr) {
          if (!set.has(t.id)) {
            set.add(t.id)
            unique.push(t)
          }
        }

        return unique
      }, [newArr])
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
      getTagsByName: 'tag/getTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    isRoot() {
      return !this.header
    },
    app() {
      return document.getElementById('app')
    },
    taskHeight() {
      return this.isDesktop ? 38 : 50
    },
    filter() {
      return (h) => {
        let ts = h.filter(this.savedTasks, h, this.showCompleted)
        if (ts.length === 0) return []

        let order = []
        if (h.order)
          order = h.order()
        ts = utils.checkMissingIdsAndSortArr(order, ts)
        ts = utilsTask.filterTasksByViewRendererFilterOptions(ts, this.activeTags, this.activeList)

        if (ts.length > 0) this.atLeastOneRenderedTask = true

        return ts
      }
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
      return !this.atLeastOneRenderedTask && this.tasks.length === 0 && this.illustration && !this.header
    },
    isSelecting() {
      return this.selected.length > 0
    },
  },
  watch: {
    tasks(newArr) {
      this.atLeastOneRenderedTask = false
      setTimeout(() => {
        if (!this.changedViewName) {
          this.clearLazySettimeout()
          this.removeRepeated(newArr).then(arr => {
            this.lazyTasks = arr
          })
        }
        
        }, 35)
    },
    headings(newArr) {
      setTimeout(() => {
        if (!this.changedViewName) {
          this.clearLazySettimeout()
          const unique = []
          const set = new Set()
          for (const t of newArr) {
            if (!set.has(t.id)) {
              set.add(t.id)
              unique.push(t)
            }
          }
          this.lazyHeadings = unique
        }
      }, 35)
    },
    viewName() {
      this.updateView()
    },
    enableSelect() {
      this.sortable.options.multiDrag = this.enableSelect
      this.sortable.options.multiDragKey = this.getMultiDragKey
    },
    isScrolling() {
      if (this.isScrolling) this.justScrolled = true
      else setTimeout(() => this.justScrolled = false, 500)
    },
  }
}

</script>

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

.task-trans-enter, .task-trans-leave-to {
  opacity: 0;
}

.task-trans-leave, .task-trans-enter-to {
  opacity: 1;
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
