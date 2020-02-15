
<template>
  <div class="ViewRenderer" :class="platform">
    <div class='view-wrapper'>
      <SlimModeNav v-if='isDesktop'
        :render='sidebarHided'
        :viewNameValue='viewNameValue'
      />
      <Header
        v-bind="$props"

        :inclusiveTags='inclusiveTags'
        :exclusiveTags='exclusiveTags'
        :inclusivePriority='inclusivePriority'
        :exclusivePriorities='exclusivePriorities'
        :inclusiveList='inclusiveList'
        :exclusiveLists='exclusiveLists'
        :inclusiveFolder='inclusiveFolder'
        :exclusiveFolders='exclusiveFolders'

        :tags='tagSelectionOptions'
        :removeHeaderTag='removeHeaderTag'
        :priorities='priorityOptions'
        :lists='listSelectionOptions'
        :folders='folderSelectionOptions'
        :extraIcons='extraIcons'

        :viewName="viewName"
        :options="getHeaderOptions"
        :optionsHandle='headerHandle'

        @tag='selectTag'
        @priority='selectPriority'
        @list='selectList'
        @folder='selectFolder'
      />
      <component v-if='smartComponent'
        class='component'
        :is='smartComponent'

        @update='onSmartComponentUpdate'
      />
      <CalendarEvents
        :date='getCalendarOrderDate'
      />
      <component v-if="extraListView && defer(3)" :is='extraListView.comp'
        v-bind="{...$props, ...extraListView}"

        :showCompleted='showCompleted'
        :showSomeday='passSomedayTasks'
        :selectEverythingToggle='selectEverythingToggle'
        :openCalendar='getHelperComponent === "LongCalendarPicker"'

        @allow-someday='showSomeday = true'

        @go='go'

        @items-ids='getAllListsIds'
      />
      <transition name="fade-t">
        <component v-if="defer(2)" :is='getViewComp' class='view-renderer-move'
          v-bind="$props"

          :updateHeadingIds='updateHeadingIds'
          :showHeadingFloatingButton='showHeadingFloatingButton'
          :showCompleted='showCompleted'
          :showSomeday='passSomedayTasks'
          :pipeFilterOptions='pipeFilterOptions'
          :selectEverythingToggle='selectEverythingToggle'
          :taskIconDropOptions='taskIconDropOptions'
          :autoSchedule='autoSchedule'
          :openCalendar='getHelperComponent === "LongCalendarPicker"'

          @allow-someday='showSomeday = true'
          @root-non-filtered='getRootNonFilteredFromTaskHandler'
          @save-schedule-object='saveScheduleObject'

          @present-tags='v => presentTags = v'
          @present-lists='v => presentLists = v'
          @present-folders='v => presentFolders = v'

          @go='go'

          @items-ids='getAllTasksIds'
        />
      </transition>
      <div style='height: 400px'></div>
    </div>
    <transition name="fade-t" mode="out-in">
      <ActionButtons
        v-if="!getHelperComponent && isTaskHandler" key="buttons"
      />
      <HelperComponent v-else-if='getHelperComponent'
        :comp='getHelperComponent'
        key="helper"
        @close='helperComponent = null'
      />
    </transition>
  </div>
</template>

<script>

import HeaderVue from './Headings/Header/Header.vue'
import ActionButtonsVue from './FloatingButtons/ActionButtons.vue'
import SlimModeNav from './SlimModeNav.vue'
import HelperComponent from './HelperComponent.vue'
import TaskHandler from './Views/TaskHandler.vue'
import ListHandler from './Views/ListHandler.vue'
import Pomodoro from './Views/Pomodoro/Pomodoro.vue'
import Statistics from './Views/Statistics/Statistics.vue'
import Defer from '@/mixins/defer'
import CalendarEvents from './RenderComponents/CalendarEvents.vue'

import ViewRendererLongCalendarPicker from '@/components/View/SmartComponents/ViewRendererLongCalendarPicker.vue'

import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment'

import { pipeBooleanFilters } from '@/utils/memo'

const MAXIMUM_TOUCH_DISTANCE = 100
const MINIMUM_DISTANCE = 10

export default {
  mixins: [
    Defer(),
  ],
  props: ['viewName', 'viewType', 'isSmart', 'viewNameValue',

  'width', 'sidebarHided',

  'headingEditOptions', 'showEmptyHeadings', 'icon', 'notes', 'removeListHandlerWhenThereArentLists', 'saveHeaderContent',
  'headerOptions', 'headerInfo', 'disableFloatingButton',
  'progress', 'tasksOrder',  'rootFallbackItem', 'mainFallbackItem', 'savedSchedule', 'extraListView', 'removeHeaderTag', 'saveHeaderName',
  'getCalendarOrderDate', 'viewItem',
  'showHeading', 'smartComponent', 'onSmartComponentUpdate', 'viewComponent',
  
  'mainFilter', 'rootFilter' ,'headings', 'headingsOrder', 'onSortableAdd',  'updateHeadingIds', 'showAllHeadingsItems', 'itemCompletionCompareDate', 'configFilterOptions'],
  components: {
    ListHandler, CalendarEvents,
    TaskHandler,
    Header: HeaderVue, HelperComponent,
    ActionButtons: ActionButtonsVue,
    ViewRendererLongCalendarPicker,
    Pomodoro, Statistics,
    SlimModeNav,
  },
  data() {
    return {
      pagination: 0,
      showingTagSelection: false,
      showingListSelection: false,
      showingFolderSelection: false,
      showingPrioritySelection: false,
      showCompleted: false,
      showSomeday: false,
      helperComponent: false,

      presentTags: [],
      presentLists: [],
      presentFolders: [],
      additionalTags: [],
      additionalLists: [],
      additionalFolders: [],

      rootNonFiltered: [],
      computedHeaderOptions: [],
      autoSchedule: null,

      inclusiveTags: [],
      exclusiveTags: [],
      inclusivePriority: null,
      exclusivePriorities: [],
      inclusiveList: null,
      exclusiveLists: [],
      inclusiveFolder: null,
      exclusiveFolders: [],

      initialX: 0,
      initialY: 0,
      diffX: 0,
      touchFail: false,
      right: false,

      selectEverythingToggle: false,
      keypressed: '',
      keypressedSettimeout: null,

      allViewTasksIds: [],
      allListsIds: [],
    }
  },
  created() {
    this.getComputedOptions()
    this.showingTagSelection = localStorage.getItem('tagFilters') === 'true'
    this.showingFolderSelection = localStorage.getItem('folderFilters') === 'true'
    this.showingListSelection = localStorage.getItem('listFilters') === 'true'
    this.autoSchedule = this.savedSchedule

    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keypress', this.keypress)
  },
  mounted() {
    this.getComputedOptions()
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keypress', this.keypress)
  },
  methods: {
    ...mapMutations(['saveMainSelection']),
    ...mapActions(['getOptions']),
    getAllTasksIds(ids) {
      this.allViewTasksIds = ids
    },
    getAllListsIds(ids) {
      this.allListsIds = ids
    },


    go(dire) {
      const ids = this.allViewItemsIds
      
      if (dire === null)
        this.select(null)
      else if (this.mainSelection) {
        if (dire === true || dire === false)
          this.select(this.mainSelectionIndex + (dire === true ? 1 : -1), dire)
        else
          this.select(dire)  
      } else if (dire > 0)
        this.select(0)
      else
        this.select(ids.length - 1)
    },
    select(i, dire) {
      if (i === null) {
        this.saveMainSelection(null)
      } else {
        const ids = this.allViewItemsIds

        if (ids[i]) {
          this.saveMainSelection(ids[i])
        } else if (dire !== undefined) {
          if (dire) {
            this.saveMainSelection(ids[0])
          } else {
            this.saveMainSelection(ids[ids.length - 1])
          }
        } else if (!ids[i] && this.mainSelectionIsNotInView) {
          this.select(null)
        }
      }
    },
    addDuration() {
      const ids = this.fallbackSelected

      const split = this.keypressed.split(':')
      if (ids && this.keypressed.length > 0) {
        let h = split[0]
        let m = split[1]

        if (!m) {
          m = h
          h = '0'
        }
        
        const dur = mom(`${h}:${m}`, 'H:m', true)
        const time = dur.format('HH:mm')

        if (dur.isValid() && time !== '00:00')
          this.$store.dispatch('task/saveTasksById', {
            ids,
            task: {
              taskDuration: dur.format('HH:mm')
            }
          })
      }
    },
    keydown(evt) {
      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')
      
      if (!isTyping) {
        const p = () => evt.preventDefault()
        const {key} = evt
        const hasSelected = this.selectedItems.length > 0
  
        const fallbackItems = this.fallbackSelected
        
        if (!isTyping && (!this.mainSelection || this.mainSelectionIsNotInView)) {
          switch (key) {
            case 'ArrowDown': {
              this.go(true)
              p()
              break
            }
            case 'ArrowUp': {
              this.go(false)
              p()
              break
            }
          }
        }
  
        switch (key) {
          case 'ArrowLeft': {
            this.go(null)
            break
          }
          case 'ArrowRight': {
            this.go(null)
            break
          }
          case '/': {
            this.$emit('sidebar')
            break
          }
        }
        
        if (this.isOnControl) {
          switch (key) {
            case "a": {
              p()
              this.selectEverythingToggle = true
              setTimeout(() => {
                this.selectEverythingToggle = false
              })
              break
            }
            case 'c': {
              if (fallbackItems && fallbackItems.length === 1 && this.shortcutsType === 'Task') {
                this.$store.commit('addTaskToClipboard', this.getTasksById(fallbackItems)[0])
              }
              break
            }
            case 'v': {
              if (fallbackItems && fallbackItems.length === 1 && this.shortcutsType === 'Task') {
                this.$store.commit('pasteTask')
              }
              break
            }
          }
        }
  
        utils.saveByShortcut(this, false, key, p, (type, item) => {
          const dispatch = this.$store.dispatch
  
          if (this.shortcutsType === 'Task') {
  
            if (fallbackItems)
              switch (type) {
                case 'delete': {
                  dispatch('task/deleteTasks', fallbackItems)
                  break
                }
                case 'save': {
                  dispatch('task/saveTasksById', {
                    ids: fallbackItems,
                    task: item,
                  })
                  break
                }
                case 'toggleCompletion': {
                  const tasks = this.getTasksById(fallbackItems)
                  const completed = tasks.filter(t => t.completed)
                  const uncompleted = tasks.filter(t => !t.completed)
                  if (uncompleted.length > 0)
                    dispatch('task/completeTasks', uncompleted)
                  if (completed.length > 0)
                    dispatch('task/uncompleteTasks', completed)
                  break
                }
                case 'toggleCancel': {
                  const tasks = this.getTasksById(fallbackItems)
                  const canceled = tasks.filter(t => t.canceled)
                  const uncanceled = tasks.filter(t => !t.canceled)
                  if (uncanceled.length > 0)
                    dispatch('task/cancelTasks', uncanceled.map(el => el.id))
                  if (canceled.length > 0)
                    dispatch('task/uncancelTasks', canceled.map(el => el.id))
                  break
                }
                case 'pomo': {
                  dispatch('pomo/save', this.getTasksById(fallbackItems)[0])
                  break
                }
              }
  
          } else {
  
            switch (type) {
              case 'delete': {
                dispatch('list/deleteMultipleListsByIds', {
                  ids: fallbackItems,
                  tasks: this.tasks,
                })
                break
              }
              case 'toggleCompletion': {
                const lists = this.getListsById(fallbackItems)
                const completed = lists.filter(l => l.completed)
                const uncompleted = lists.filter(t => !t.completed)
                if (uncompleted.length > 0)
                  dispatch('list/completeLists', uncompleted)
                if (completed.length > 0)
                  dispatch('list/uncompleteLists', completed)
                break
              }
              case 'save': {
                if (item.tags) {
                  dispatch('list/saveListsById', {
                    list: item,
                    ids: fallbackItems,
                  })
                } else if (item.calendar && item.calendar.specific) {
                  dispatch('list/saveListsById', {
                    list: {deadline: item.calendar.specific},
                    ids: fallbackItems
                  })
                } else if (item.calendar || (item.calendar === null)) {
                  dispatch('list/saveListsById', {
                    list: {calendar: item.calendar},
                    ids: fallbackItems,
                  })
                } else if (item.folder) {
                  dispatch('list/saveListsById', {
                    list: {folder: item.folder},
                    ids: fallbackItems,
                  })
                }
                break
              }
            }
          }
        })
        
        if (this.isOnShift)
          switch (key) {
            case "ArrowUp": {
              this.go(0)
              break
            }
            case "ArrowDown": {
              this.go(this.allViewItemsIds.length - 1)
              break
            }
          }
        
        if (this.isOnControl && !this.isOnShift) {
          switch (key) {
            case 'd': {
              if (this.fallbackSelected)
                p()
              this.addDuration()
            }
          }
        }
  
        if (this.isOnAlt && this.isOnControl)
          switch (key) {
            case 's': {
              this.toggleCalendar()
              break
            }
          }
  
        if (this.isOnAlt && !this.isOnControl)
          switch (key) {
            case 'c': {
              this.showCompleted = !this.showCompleted
              break
            }
            case 'o': {
              this.showSomeday = !this.showSomeday
              break
            }
          }
      }
    },
    keypress({key}) {
      this.keypressed += key

      if (this.keypressedSettimeout)
        clearTimeout(this.keypressedSettimeout)

      this.keypressedSettimeout = setTimeout(() => {
        this.keypressed = ''
      }, 3000)
    },
    selectSound(name) {
      this.$store.commit('pomo/selectTickSound', name)
    },

    
    async getComputedOptions() {
      if (this.headerOptions)
        this.computedHeaderOptions = await this.getOptions(this.headerOptions)
      else this.computedHeaderOptions = []
    },
    toggleCalendar() {
      if (this.helperComponent === "LongCalendarPicker")
        this.helperComponent = null
      else
        this.helperComponent = "LongCalendarPicker"
    },
    saveScheduleObject(obj) {
      this.$emit('save-schedule', {
        ...this.autoSchedule,
        scheduleObject: obj,
      })
    },
    assignUser(assigned) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedItems,
        task: {assigned},
      })
    },
    saveAutoSchedule(info) {
      this.autoSchedule = info
      if (info === null)
        this.$emit('save-schedule', info)
    },

    selectPagination(newPage) {
      this.pagination = newPage
    },
    selectTag(name) {
      const inc = this.inclusiveTags
      const exc = this.exclusiveTags
      if (!inc.includes(name) && !exc.includes(name)) {
        inc.push(name)
      } else if (inc.includes(name)) {
        const i = inc.findIndex(el => el === name)
        inc.splice(i, 1)
        exc.push(name)
      } else {
        const i = exc.findIndex(el => el === name)
        exc.splice(i, 1)
      }
    },
    selectPriority(name) {
      const inc = this.inclusivePriority
      const exc = this.exclusivePriorities
      if (inc !== name && !exc.includes(name)) {
        this.inclusivePriority = name
      } else if (inc === name) {
        this.inclusivePriority = null
        exc.push(name)
      } else {
        const i = exc.findIndex(el => el === name)
        exc.splice(i, 1)
      }
    },
    selectList(name) {
      this.inclusiveFolder = null
      this.exclusiveFolders = []
      if (this.inclusiveList !== name && !this.exclusiveLists.includes(name)) {
        this.inclusiveList = name
      } else if (this.inclusiveList === name) {
        this.inclusiveList = null
        this.exclusiveLists.push(name)
      } else {
        const index = this.exclusiveLists.findIndex(el => el === name)
        this.exclusiveLists.splice(index, 1)
      }
    },
    selectFolder(name) {
      this.inclusiveList = null
      this.exclusiveLists = []
      if (this.inclusiveFolder !== name && !this.exclusiveFolders.includes(name)) {
        this.inclusiveFolder = name
      } else if (this.inclusiveFolder === name) {
        this.inclusiveFolder = null
        this.exclusiveFolders.push(name)
      } else {
        const index = this.exclusiveFolders.findIndex(el => el === name)
        this.exclusiveFolders.splice(index, 1)
      }
    },
    toggleTagSelection() {
      this.showingTagSelection = !this.showingTagSelection
      this.inclusiveTags = []
      this.exclusiveTags = []
    },
    toggleListSelection() {
      this.showingListSelection = !this.showingListSelection
      this.inclusiveList = ''
      this.exclusiveLists = []
    },
    togglePrioritySelection() {
      this.showingPrioritySelection = !this.showingPrioritySelection
      this.inclusivePriority = null
      this.exclusivePriorities = []
    },
    toggleFolderSelection() {
      this.showingFolderSelection = !this.showingFolderSelection
      this.inclusiveFolders = ''
      this.exclusiveFolder = ''
    },

    getRootNonFilteredFromTaskHandler(rootNonFiltered) {
      this.rootNonFiltered = rootNonFiltered
    },
    updateIds(ids) {
      this.$emit('update-ids', ids)
    },
    sortByName() {
      const tasks = this.rootNonFiltered.slice()
      tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      this.updateIds(tasks.map(el => el.id))
    },
    sortByPriority() {
      let tasks = this.rootNonFiltered.slice()
      tasks = utilsTask.sortTasksByPriority(tasks)
      this.updateIds(tasks.map(el => el.id))
    },
    sortByDate() {
      const tasks = utilsTask.sortTasksByTaskDate(this.rootNonFiltered.slice())
      this.updateIds(tasks.map(el => el.id))
    },
    sortByDurationLong() {
      let tasks = utilsTask.sortTasksByTaskDate(this.rootNonFiltered.slice())
      tasks = utilsTask.sortTasksByDuration(tasks, 'long')
      this.updateIds(tasks.map(el => el.id))
    },
    sortByDurationShort() {
      let tasks = utilsTask.sortTasksByTaskDate(this.rootNonFiltered.slice())
      tasks = utilsTask.sortTasksByDuration(tasks, 'short')
      this.updateIds(tasks.map(el => el.id))
    },

    toggleCompleted() {
      this.showCompleted = !this.showCompleted
    },
    saveDates(calendar, ids) {
      this.$store.dispatch('task/saveTasksById', {
        ids,
        task: {calendar},
      })
    },
    addTagToTasks(id) {
      this.$store.dispatch('task/addTagsToTasksById', {
        ids: this.selectedItems,
        tagIds: [id],
      })
    },
    removeTasksFromLists() {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedItems,
        task: {list: ''},
      })
    },
    savePomoOpt(opt) {

      const fix = s => `${s.split(':')[1]}:00`

      const obj = {
        pomo: {
          duration: fix(opt.duration),
          shortRest: fix(opt.shortRest),
          longRest: fix(opt.longRest),
        }
      }
      
      this.$store.dispatch('setInfo', obj)

      this.$store.dispatch('pomo/updateDurations', obj)
    },
  },
  computed: {
    ...mapState({
      viewOrders: state => state.list.viewOrders,
      selectedItems: state => state.selectedItems,
      userInfo: state => state.userInfo,
      selectedType: state => state.selectedType,
      runningPomo: state => state.pomo.running,
      rest: state => state.pomo.rest,
      openHelper: state => state.pomo.openHelper,
      mainSelection: state => state.mainSelection,

      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,

      currentTickSound: state => state.pomo.currentTickSound,
      availableSounds: state => state.pomo.availableSounds,
    }),
    ...mapGetters({
      platform: 'platform',
      isDesktop: 'isDesktop',
      lists: 'list/sortedLists',
      tasks: 'task/tasks',
      folders: 'folder/sortedFolders',
      tags: 'tag/sortedTagsByName',
      fallbackSelected: 'fallbackSelected',

      getTagsByName: 'tag/getTagsByName',
      getTagsById: 'tag/getTagsById',
      getSubTagsByTagId: 'tag/getSubTagsByTagId',
      getListsById: 'list/getListsById',
      getListsByName: 'list/getListsByName',
      getFoldersByName: 'folder/getFoldersByName',
      getFoldersById: 'folder/getFoldersById',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',
      getTasksById: 'task/getTasksById',

      doesTaskPassExclusiveFolders: 'task/doesTaskPassExclusiveFolders',
      doesTaskPassInclusiveFolder: 'task/doesTaskPassInclusiveFolder',
      doesTaskPassExclusiveLists: 'task/doesTaskPassExclusiveLists',
      doesTaskPassInclusiveList: 'task/doesTaskPassInclusiveList',
      doesTaskPassExclusiveTags: 'task/doesTaskPassExclusiveTags',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      doesTaskPassInclusivePriority: 'task/doesTaskPassInclusivePriority',
      doesTaskPassExclusivePriorities: 'task/doesTaskPassExclusivePriorities',
    }),
    mainSelectionIndex() {
      if (!this.mainSelection)
        return null
      return this.allViewItemsIds.indexOf(this.mainSelection)
    },
    allViewItemsIds() {
      return [...this.allListsIds, ...this.allViewTasksIds]
    },
    showHeadingFloatingButton() {
      return this.viewType === 'list' && !this.isSmart
    },
    mainSelectionIsNotInView() {
      return !this.allViewItemsIds.includes(this.mainSelection)
    },
    getPomoOptions() {
      if (this.userInfo && this.userInfo.pomo)
        return this.userInfo.pomo
      return {
        duration: '25:00',
        shortRest: '05:00',
        longRest: '15:00',
      }
    },
    shortcutsType() {
      if (this.selectedItems.length > 0)
        return this.selectedType
      if (this.tasks.find(t => t.id === this.mainSelection))
        return 'Task'
      return 'List'
    },
    getHelperComponent() {
      return (this.openHelper && this.viewName !== 'Pomodoro') ? 'PomoHelper' : this.helperComponent
    },
    isTaskHandler() {
      return this.getViewComp === 'TaskHandler'
    },
    getHeaderOptions() {
      if (this.getViewComp === 'Statistics')
        return []
      return this.viewName === 'Pomodoro' ? this.pomoOptions : this.taskIconDropOptions
    },
    pomoOptions() {
      const getOptions = (opt, save) => {
        const {duration, shortRest, longRest} = opt

        if (save) this.savePomoOpt(opt)

        const f = utils.formatQuantity

        return [
          {
            name: `Tick sound: <span class="fade">${this.currentTickSound}</span>`,
            callback: () => this.availableSounds.map(name => ({
              name,
              callback: () => {
                this.selectSound(name)
                return getOptions({
                  duration, shortRest, longRest,
                }, true)
              }
            }))
          },
          {
            name: `${'Duration: '}<span class="fade">${f(duration)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: 'Duration: ',
                callback: newTime => getOptions({
                  duration: newTime, shortRest, longRest,
                }, true)
              }
            }),
          },
          {
            name: `${'Short rest: '}<span class="fade">${f(shortRest)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: 'Short rest: ',
                callback: newTime => getOptions({
                  duration, shortRest: newTime, longRest,
                }, true)
              }
            }),
          },
          {
            name: `${'Long rest: '}<span class="fade">${f(longRest)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: 'Long rest: ',
                callback: newTime => getOptions({
                  duration, shortRest, longRest: newTime,
                }, true)
              }
            }),
          },
        ]
      }

      const unfix = obj => {
        const fix = str => `00:${str.split(':')[0]}`
        
        const {duration, longRest, shortRest} = obj
        return {
          ...obj,
          duration: fix(duration),
          longRest: fix(longRest),
          shortRest: fix(shortRest),
        }
      }
      
      return getOptions(unfix(this.getPomoOptions))
    },
    headerHandle() {
      return (this.viewComponent === 'Pomodoro') ? 'pomo' : 'settings-v'
    },
    el() {
      const el = this.$el.getElementsByClassName('view-renderer-move')[0]
      return el.style
    },
    extraIcons() {
      const arr = []
      if (this.showingListSelection)
        arr.push({
          icon: 'tasks',
          callback: () => this.showingListSelection = false
        })
      if (this.showingTagSelection)
        arr.push({
          icon: 'tag',
          callback: () => this.showingTagSelection = false
        })
      if (this.showingFolderSelection)
        arr.push({
          icon: 'folder',
          callback: () => this.showingFolderSelection = false
        })
      if (this.showingPrioritySelection)
        arr.push({
          icon: 'priority',
          callback: () => this.showingPrioritySelection = false
        })
      if (this.showCompleted)
        arr.push({
          icon: 'circle-check',
          callback: () => this.showCompleted = false,
        })
      if (this.showSomeday)
        arr.push({
          icon: 'archive',
          callback: () => this.showSomeday = false,
        })
      return arr
    },
    isSearch() {
      return this.isSmart && this.viewNameValue === "Search"
    },
    pipeFilterOptions() {
      const toPipe = []
      const {tags, list, folder, priorities} = this.getFilterOptions

      if (tags.inclusive.length > 0)
        toPipe.push(t => this.doesTaskPassInclusiveTags(t, tags.inclusive, this.tags || []))
      if (tags.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveTags(t, tags.exclusive, this.tags || []))

      if (priorities.inclusive)
        toPipe.push(t => this.doesTaskPassInclusivePriority(t, priorities.inclusive))
      if (priorities.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusivePriorities(t, priorities.exclusive))

      if (list.inclusive)
        toPipe.push(t => this.doesTaskPassInclusiveList(t, list.inclusive))
      if (list.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveLists(t, list.exclusive))

      if (folder.inclusive)
        toPipe.push(t => this.doesTaskPassInclusiveFolder(t, folder.inclusive))
      if (folder.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveFolders(t, folder.exclusive))
      
      if (toPipe.length > 0) {
        return pipeBooleanFilters(...toPipe)
      }
      return () => true
    },
    priorityOptions() {
      return this.showingPrioritySelection ? [
        'High priority',
        'Medium priority',
        'Low priority',
        'No priority',
      ] : []
    },
    passSomedayTasks() {
      return this.isSomeday || this.showSomeday || this.isSearch
    },
    isSomeday() {
      return this.isSmart && this.viewName === 'Someday'
    },
    getActiveTags() {
      const arr = this.inclusiveTags.slice()
      if (this.viewType === 'tag' && !arr.includes(this.viewName))
        arr.push(this.viewName)
      return arr
    },
    tagSelectionStr() {
      return 'showingTagSelection' + this.viewName + this.viewType
    },
    listSelectionStr() {
      return 'showingListSelection' + this.viewName + this.viewType
    },
    tagSelectionOptions() {
      let arr = [...this.getTagsById(this.presentTags)]
      if (this.viewType === 'tag') {
        const tags = this.getTagsByName([this.viewName])
        if (tags[0])
          arr = [...arr, ...this.getSubTagsByTagId(tags[0].id)]
      }
      return this.showingTagSelection ?
         arr :
        []
    },
    listSelectionOptions() {
      return this.showingListSelection ? this.getListsById(this.presentLists) : []
    },
    folderSelectionOptions() {
      return this.showingFolderSelection ? this.getFoldersById(this.presentFolders) : []
    },
    getIconDropOptionsTags() {
      const arr = []
      const tags = this.tags
      for (const t of tags) {
        arr.push({
          name: t.name,
          icon: 'tag',
          callback: () => this.addTagToTasks(t.id),
        })
      }
      return arr
    },
    getIconDropOptionsFolders() {
      const moveToList = (obj) => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedItems,
          task: {...obj, folder: null, group: null,},
        })
      }
      const links = []
      const folders = this.folders
      for (const fold of folders) {
        links.push({
          name: fold.name,
          icon: 'folder',
          callback: () => {
            this.$store.dispatch('task/saveTasksById', {
              ids: this.selectedItems,
              task: {folder: fold.id, list: null, group: null},
            })
          },
        })
      }
      return links
    },
    getViewComp() {
      return this.viewComponent || "TaskHandler"
    },
    getIconDropOptionsLists() {
      const moveToList = (obj) => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedItems,
          task: {...obj, folder: null, group: null,},
        })
      }
      const links = []
      const lists = this.lists
      for (const list of lists) {
        links.push({
          name: list.name,
          icon: 'tasks',
          callback: () => {
            const arr = [{
              name: 'List root',
              callback: () => moveToList({list: list.id, heading: null})
            }]
            for (const h of list.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => moveToList({list: list.id, heading: h.id})
              })
            }
            return arr
          },
        })
      }
      return links
    },
    taskIconDropOptions() {
      const dispatch = this.$store.dispatch
      const ids = this.selectedItems

      const savePri = (pri) => {
        dispatch('task/saveTasksById', {ids, task: {priority: pri}})
      }

      const formatTime = time => mom(time, 'HH:mm').format(this.userInfo.disablePmFormat ? 'HH:mm' : 'LT')

      const getScheduleIconDropObject = info => {
        if (!info)
            info = {time: mom().format('HH:mm'), buffer: '00:05', fallback: '00:15'}
        
        const {time, buffer, fallback} = info

        return [
          {
            name: `${'Start from:'} <span class="fade">${formatTime(time)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                msg: 'Start from:',
                callback: newTime => getScheduleIconDropObject({
                  time: newTime, buffer, fallback,
                })
              }
            })
          },
          {
            name: `${'Buffer time:'} <span class="fade">${utils.formatQuantity(buffer)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: "Buffer time:",
                callback: newBuffer => getScheduleIconDropObject({
                  time, buffer: newBuffer, fallback,
                })
              }
            })
          },
          {
            name: `${'Fallback time:'} <span class="fade">${utils.formatQuantity(fallback)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: "Buffer time:",
                callback: newFallback => getScheduleIconDropObject({
                  time, buffer, fallback: newFallback,
                })
              }
            })
          },
          {
            name: 'Auto schedule',
            callback: () => {
              this.saveAutoSchedule({...info})
              return null
            },
            type: 'button',
          },
        ]
      }
      
      const saveDeadline = deadline => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedItems,
          task: {
            deadline,
          }
        })
      }

      const logItems = () => {
        if (this.shortcutsType === "Task") {
          this.$store.dispatch('task/logTasks', ids)
        }
      }
      
      if (ids.length === 0) {
        let opt = [
          {
            name: 'Sort tasks',
            icon: 'sort',
            callback: () => [
              {
                name: 'Sort by name',
                icon: 'sort-name',
                callback: () => this.sortByName()
              },
              {
                name: 'Sort by priority',
                icon: 'priority',
                callback: () => this.sortByPriority()
              },
              {
                name: 'Sort by creation date',
                icon: 'calendar',
                callback: () => this.sortByDate(),
              },
              {
                name: 'Sort by duration(long to short)',
                icon: 'magic',
                callback: () => this.sortByDurationLong()
              },
              {
                name: 'Sort by duration(short to long)',
                icon: 'magic',
                callback: () => this.sortByDurationShort()
              },
            ],
          },
          {
            name: 'Filter tasks',
            icon: 'filter',
            callback: () => [
              {
                name: 'Filter by tags',
                icon: 'tag',
                callback: () => this.toggleTagSelection()
              },
              {
                name: 'Filter by priority',
                icon: 'priority',
                callback: () => this.togglePrioritySelection()
              },
              {
                name: 'Filter by lists',
                icon: 'tasks',
                callback: () => this.toggleListSelection()
              },
              {
                name: 'Filter by folders',
                icon: 'folder',
                callback: () => this.toggleFolderSelection()
              },
            ],
          },
          {
            name: 'Open calendar',
            icon: 'calendar',
            callback: () => {
              if (this.helperComponent !== 'LongCalendarPicker')
                this.helperComponent = 'LongCalendarPicker'
              else this.helperComponent = null
            }
          },
          {
            name: 'Auto schedule',
            icon: 'magic',
            callback: () => {
              if (this.autoSchedule)
                return [
                  {
                    name: 'Remove schedule',
                    callback: () => this.saveAutoSchedule(null)
                  },
                  {
                    name: 'Edit schedule',
                    callback: () => getScheduleIconDropObject(this.autoSchedule)
                  }
                ]
              return getScheduleIconDropObject(null)
            }
          },
          {
            name: 'Show completed',
            icon: 'circle-check',
            callback: () => this.toggleCompleted()
          },
        ]
        if (this.computedHeaderOptions && this.computedHeaderOptions.length > 0) {
          opt.push({
            type: 'hr',
            name: 'division',
          })
          opt = [...opt, ...this.computedHeaderOptions]
        }
        return opt
      } else {
        const opt = [
          {
            name: 'Move to logbook',
            icon: 'logbook',
            callback: () => logItems()
          },
          {
            name: 'Move to list',
            icon: 'tasks',
            callback: () => {return {
              allowSearch: true,
              links: this.getIconDropOptionsLists,
            }}
          },
          {
            name: 'Move to folder',
            icon: 'folder',
            callback: () => {return {
              allowSearch: true,
              links: this.getIconDropOptionsFolders,
            }}
          },
          {
            type: 'optionsList',
            name: 'Deadline',
            options: [
              {
                icon: 'star',
                id: 'd',
                callback: () => saveDeadline(mom().format('Y-M-D')),
              },
              {
                icon: 'sun',
                id: 'çljk',
                callback: () => saveDeadline(mom().add(1, 'day').format('Y-M-D')),
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                callback: () => ({
                  comp: 'CalendarPicker',
                  content: {
                    onlyDates: true,
                    noTime: true,
                    allowNull: true,
                    callback: ({specific}) => {saveDeadline(specific,
                    )}
                  }
                })
              },
              {
                icon: 'bloqued',
                id: 'asdf',
                callback: () => saveDeadline(null),
              },
            ]
          },
          {
            type: 'optionsList',
            name: 'Defer',
            options: [
              {
                icon: 'star',
                id: 'd',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'sun',
                id: 'çljk',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().add(1, 'day').format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'archive',
                id: 'açlkjsdffds',
                callback: () => this.saveDates({
                  type: 'someday',
                }, ids)
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                callback: () => {return {
                  comp: "CalendarPicker",
                  content: {callback: date => this.saveDates(date, ids)}}},
              },
              {
                id: 'No date',
                icon: 'bloqued',
                callback: () => this.saveDates(null, ids)
              },
            ]
          },
          {
            type: 'optionsList',
            name: 'Priority',
            options: [
              {
                icon: 'priority',
                id: 'd',
                color: 'var(--fade)',
                callback: () => savePri('')
              },
              {
                icon: 'priority',
                id: 'f',
                color: 'var(--green)',
                callback: () => savePri('Low priority')
              },
              {
                icon: 'priority',
                id: 'j',
                color: 'var(--yellow)',
                callback: () => savePri('Medium priority')
              },
              {
                icon: 'priority',
                id: 'l',
                color: 'var(--red)',
                callback: () => savePri('High priority')
              },
            ],
          },
          {
            name: 'Delete tasks',
            icon: 'trash',
            important: true,
            callback: () => dispatch('task/deleteTasks', ids)
          },
        ]
        if (((this.viewItem && this.viewItem.group) || (this.viewType === 'group')) && this.viewItem)
          opt.unshift(this.getAssigneeIconDrop({group: this.viewItem.group || this.viewItem.id}, uid => this.assignUser(uid)))
        return opt
      }
    },

    getFilterOptions() {
      return {
        tags: {
          inclusive: this.getInclusiveTagIds,
          exclusive: this.getExclusiveTagIds,
        },
        priorities: {
          inclusive: this.inclusivePriority,
          exclusive: this.exclusivePriorities,
        },
        list: {
          inclusive: this.getInclusiveListId,
          exclusive: this.getExclusiveListsId,
        },
        folder: {
          inclusive: this.getInclusiveFolderId,
          exclusive: this.getExclusiveFoldersId,
        },
      }
    },
    getInclusiveTagIds() {
      return this.getTagsByName(this.inclusiveTags).map(el => el.id)
    },
    getExclusiveTagIds() {
      return this.getTagsByName(this.exclusiveTags).map(el => el.id)
    },
    getInclusiveListId() {
      if (this.inclusiveList)
        return this.getListsByName([this.inclusiveList])[0].id
      return null
    },
    getExclusiveListsId() {
      if (this.exclusiveLists)
        return this.getListsByName(this.exclusiveLists).map(el => el.id)
      return null
    },
    getInclusiveFolderId() {
      if (this.inclusiveFolder)
        return this.getFoldersByName([this.inclusiveFolder])[0].id
      return null
    },
    getExclusiveFoldersId() {
      if (this.exclusiveFolders)
        return this.getFoldersByName(this.exclusiveFolders).map(el => el.id)
      return null
    },
  },
  watch: {
    viewName() {
      this.autoSchedule = null
      this.getComputedOptions()
      this.saveMainSelection(null)
    },
    savedSchedule() {
      this.autoSchedule = this.savedSchedule
    },
    viewNameValue() {
      this.showSomeday = false
    },
    headerOptions() {
      this.getComputedOptions()
    },
    
  }
}

</script>

<style scoped>

.ViewRenderer {
  margin: 0 95px;
  min-height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.extend {
  height: 100%;
  width: 100%;
}

.view-wrapper {
  width: 100%;
  min-height: 100%;
}

.ViewRenderer.mobile {
  margin: 0 8px;
  margin-top: -4px;
}

.component {
  z-index: 3;
}

.view-renderer-move {
  z-index: 2;
}

</style>
