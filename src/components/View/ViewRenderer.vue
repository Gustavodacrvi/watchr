
<template>
  <div class="ViewRenderer" :class="layout">
    <div class='view-wrapper'>
      <SlimModeNav
        ref='mainComp'
      
        :render='sidebarHided || scheduling'
        :scheduling='scheduling'
        :viewName='viewName'
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
        :inclusiveGroup='inclusiveGroup'
        :exclusiveGroups='exclusiveGroups'

        :extraIcons='extraIcons'

        :removeHeaderTag='removeHeaderTag'
        :priorities='priorityOptions'

        :tags='tagSelectionOptions'
        :lists='listSelectionOptions'
        :folders='folderSelectionOptions'
        :groups='groupSelectionOptions'

        :viewName="viewName"
        :options="viewRendererOptions"
        :optionsHandle='headerHandle'

        @tag='selectTag'
        @priority='selectPriority'
        @list='selectList'
        @folder='selectFolder'
        @group='selectGroup'

        @open-main-comp='openMainComp'
      />
      <CalendarEvents/>
      <component v-if="extraListView && defer(3)" :is='extraListView.comp'
        v-bind="{...$props, ...extraListView}"
        ref='extraView'

        :showCompleted='showCompleted'
        :showSomeday='passSomedayTasks'
        :taskIconDropOptions='taskIconDropOptions'
        :filterByAssigned='filterByAssigned'

        @allow-someday='showSomeday = true'

        @go='go'

        @items-ids='getAllListsIds'
      />
      <transition name="fade-t">
        <component v-if="defer(2)" :is='getViewComp' class='view-renderer-move'
          v-bind="$props"
          ref='taskHandler'

          :updateHeadingIds='updateHeadingIds'
          :showHeadingFloatingButton='showHeadingFloatingButton'
          :showCompleted='showCompleted'
          :showSomeday='passSomedayTasks'
          :pipeFilterOptions='pipeFilterOptions'
          :taskIconDropOptions='taskIconDropOptions'
          :filterByAssigned='filterByAssigned'
          :showingRuler='showingRuler'

          @allow-someday='showSomeday = true'
          @root-non-filtered='getRootNonFilteredFromTaskHandler'
          @auto-schedule-from-heading='saveAutoSchedule'

          @present-tags='getPresentTags'
          @present-lists='getPresentLists'
          @present-folders='getPresentFolders'
          @present-groups='getPresentGroups'

          @go='go'

          @items-ids='getAllTasksIds'
        />
      </transition>
      <div style='height: 400px'></div>
    </div>
    <transition name="fade-t" mode="out-in">
      <ActionButtons
        v-if="isTaskHandler" key="buttons"
        @add-task='addTask'
      />
    </transition>
  </div>
</template>

<script>

import HeaderVue from './Headings/Header/Header.vue'
import ActionButtonsVue from './FloatingButtons/ActionButtons.vue'
import SlimModeNav from './SlimModeNav.vue'
import TaskHandler from './Views/TaskHandler.vue'
import ListHandler from './Views/ListHandler.vue'
import CalendarEvents from './RenderComponents/CalendarEvents.vue'

import Defer from '@/mixins/defer'
import autoScheduleMixin from "@/mixins/autoSchedule"

import ViewRendererLongCalendarPicker from './SmartComponents/LongCalendarPicker.vue'

import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'

import { fire } from '@/store/'

import { cacheBatchedItems } from '@/utils/firestore'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment'


import { pipeBooleanFilters } from '@/utils/memo'

const MAXIMUM_TOUCH_DISTANCE = 100
const MINIMUM_DISTANCE = 10

export default {
  mixins: [
    autoScheduleMixin,
    Defer(),
  ],
  props: ['viewName', 'viewType', 'isSmart', 'viewNameValue',

  'width', 'sidebarHided',
  'fallbackFunctionData',

  'headingEditOptions', 'showEmptyHeadings', 'icon', 'notes', 'removeListHandlerWhenThereArentLists', 'saveHeaderContent',
  'headerOptions', 'headerInfo', 'disableRootActions', 'updateViewIds',
  'progress', 'tasksOrder',  'rootFallbackItem', 'mainFallbackItem', 'extraListView', 'removeHeaderTag', 'saveHeaderName',
  'calendarDate', 'viewItem',
  'showHeading', 'viewComponent',
  
  'mainFilter', 'rootFilter' ,'headings', 'headingsOrder',   'updateHeadingIds', 'showAllHeadingsItems', 'itemCompletionCompareDate', 'configFilterOptions'],
  components: {
    ListHandler, CalendarEvents,
    TaskHandler, ViewRendererLongCalendarPicker,
    Header: HeaderVue,
    ActionButtons: ActionButtonsVue,
    SlimModeNav,
  },
  data() {
    return {
      pagination: 0,
      showingTagSelection: false,
      showingListSelection: false,
      showingFolderSelection: false,
      showingGroupSelection: false,
      showingPrioritySelection: false,
      showCompleted: false,
      showSomeday: false,
      showingRuler: false,

      filterByAssigned: false,

      presentTags: [],
      presentLists: [],
      presentFolders: [],
      presentGroups: [],
      additionalTags: [],
      additionalLists: [],
      additionalFolders: [],
      additionalGroups: [],

      rootNonFiltered: [],
      computedHeaderOptions: [],

      inclusiveTags: [],
      exclusiveTags: [],
      inclusivePriority: null,
      exclusivePriorities: [],
      inclusiveList: null,
      exclusiveLists: [],
      inclusiveFolder: null,
      exclusiveFolders: [],
      inclusiveGroup: null,
      exclusiveGroups: [],

      initialX: 0,
      initialY: 0,
      diffX: 0,
      touchFail: false,
      right: false,

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
    this.showingGroupSelection = localStorage.getItem('groupFilters') === 'true'
    this.showingListSelection = localStorage.getItem('listFilters') === 'true'
    this.showingRuler = localStorage.getItem('showingRuler') === 'true'

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

    toggleRuler() {
      this.showingRuler = !this.showingRuler
      localStorage.setItem('showingRuler', this.showingRuler)
    },
    openMainComp() {
      this.$refs.mainComp.open()
    },
    addTask() {
      this.$refs.taskHandler.addTaskEdit()
    },
    selectAll() {
      this.$refs.taskHandler.selectAll()
      if (this.$refs.extraView)
        this.$refs.extraView.selectAll()
    },
    spliceRemovedElements(oldArr, presentTags, remove) {
       oldArr.forEach(el => {
         if (!presentTags.includes(el)) {
            if (remove)
              remove(el)
            else {
              const i = oldArr.findIndex(id => id === el)
              if (i > -1)
                oldArr.splice(i, 1)
            }
         }
       })
    },
    getPresentTags(v) {
      this.spliceRemovedElements(this.getInclusiveTagIds, v, id => {
        const tagName = this.getTagsById([id])[0].name
        const i = this.inclusiveTags.findIndex(name => name === tagName)
        if (i > -1)
          this.inclusiveTags.splice(i, 1)
      })

      this.presentTags = v
    },
    getPresentFolders(v) {
      if (!v.includes(this.getInclusiveFolderId))
        this.inclusiveFolder = null
      
      this.presentFolders = v
    },
    getPresentGroups(v) {
      if (!v.includes(this.getInclusiveGroupId))
        this.inclusiveGroup = null
      
      this.presentGroups = v
    },
    getPresentLists(v) {
      if (!v.includes(this.getInclusiveListId))
        this.inclusiveList = null
      
      this.presentLists = v
    },
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

        if (this.isOnShift)
          switch (key) {
            case 'ArrowRight': {
              if (this.shortcutsType === 'List' && fallbackItems.length === 1) {
                p()
                this.$router.push(`/user?list=${this.getListsById(fallbackItems)[0].name}`)
              }
              break
            }
        }
  
        if (!this.isOnShift)
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
              this.selectAll()
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

        if (this.isOnAlt && key === 'a') {
          let isTask
          let items
          
          if (this.shortcutsType === 'Task') {
            isTask = true
            items = this.getTasksById(fallbackItems)
          } else {
            isTask = false
            items = this.getListsById(fallbackItems)
          }
          const groupSet = new Set()

          items.forEach(el => {
            if (el && el.group && !groupSet.has(el.group))
              groupSet.add(el.group)
          })

          if (items.some(el => el && el.group) && groupSet.size === 1) {
            const ids = fallbackItems.slice()

            const callback = !isTask ?
                uid => this.$store.dispatch('list/saveListsById', {
                  ids,
                  list: {
                    assigned: uid,
                  },
                }) : 
                uid => this.$store.dispatch('task/saveTasksById', {
                  ids,
                  task: {
                    assigned: uid,
                  },
                })
            
            this.$store.commit('pushIconDrop',
              this.getAssigneeIconDrop({group: items[0].group}, callback)
            )
          }
        }
  
        utils.saveByShortcut(this, (this.isEditingComp || this.iconDrop), key, p, (type, item) => {
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
                case 'logbook': {
                  dispatch('task/logTasks', fallbackItems)
                  break
                }
                case 'toggleCompletion': {
                  this.$store.commit('toggleTaskCompletion', fallbackItems)
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
              }
  
          } else {
  
            switch (type) {
              case 'delete': {
                dispatch('list/deleteMultipleListsByIds', fallbackItems)
                break
              }
              case 'toggleCompletion': {
                this.$store.commit('toggleListCompletion', fallbackItems)
                break
              }
              case 'logbook': {
                dispatch('list/logLists', fallbackItems)
                break
              }
              case 'save': {
                if (item.tags) {
                  dispatch('list/saveListsById', {
                    list: item,
                    ids: fallbackItems,
                  })
                } else if (item.deadline || item.deadline === null) {
                  dispatch('list/saveListsById', {
                    list: {deadline: item.deadline},
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

    
    async getComputedOptions() {
      if (this.headerOptions)
        this.computedHeaderOptions = await this.getOptions(this.headerOptions)
      else this.computedHeaderOptions = []
    },
    assignUser(assigned) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedItems,
        task: {assigned},
      })
    },
    saveAutoSchedule({obj, calendarDate}) {
      if (this.selectedItems.length === 0)
        this.$refs.taskHandler.applyAutoSchedule(obj, calendarDate || this.calendarDate)
      else if (this.shortcutsType === 'Task')
        this.autoScheduleItems(this, calendarDate || this.calendarDate, obj, this.getTasksById(this.selectedItems))
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
      this.inclusiveGroup = null
      this.exclusiveGroups = []
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
      this.inclusiveGroup = null
      this.exclusiveGroups = []
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
    selectGroup(name) {
      this.inclusiveFolder = null
      this.exclusiveFolders = []
      this.inclusiveList = null
      this.exclusiveLists = []
      if (this.inclusiveGroup !== name && !this.exclusiveGroups.includes(name)) {
        this.inclusiveGroup = name
      } else if (this.inclusiveGroup === name) {
        this.inclusiveGroup = null
        this.exclusiveGroups.push(name)
      } else {
        const index = this.exclusiveGroups.findIndex(el => el === name)
        this.exclusiveGroups.splice(index, 1)
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
      this.inclusiveFolders = []
      this.exclusiveFolder = ''
    },
    toggleGroupSelection() {
      this.showingGroupSelection = !this.showingGroupSelection
      this.inclusiveGroups = []
      this.exclusiveGroup = ''
    },

    getRootNonFilteredFromTaskHandler(rootNonFiltered) {
      this.rootNonFiltered = rootNonFiltered
    },
    updateIds(ids) {
      const b = fire.batch()
      
      const writes = []
      
      this.updateViewIds(b, writes, {
        finalIds: ids,
        ...this.$refs.taskHandler.getUpdateIdsInfo(),
      })

      cacheBatchedItems(b, writes)

      b.commit()
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
      this.updateIds(
        utilsTask.sortTasksByTaskDate(this.rootNonFiltered.slice()).map(el => el.id)
      )
    },
    sortBySchedule() {
      this.updateIds(
        utilsTask.sortTasksByScheduleTime(this.rootNonFiltered.slice()).map(el => el.id)
      )
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
      if (this.shortcutsType === 'Task')
        this.$store.dispatch('task/saveTasksById', {
          ids,
          task: {calendar},
        })
      else
        this.$store.dispatch('list/saveListsById', {ids, list: {calendar}})
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
  },
  computed: {
    ...mapState({
      viewOrders: state => state.list.viewOrders,
      iconDrop: state => state.iconDrop,
      selectedItems: state => state.selectedItems,
      userInfo: state => state.userInfo,
      selectedType: state => state.selectedType,
      isEditingComp: state => state.isEditing,
      mainSelection: state => state.mainSelection,
      scheduling: state => state.scheduling,

      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,

      allowCalendar: state => state.allowCalendar,
    }),
    ...mapGetters({
      layout: 'layout',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      lists: 'list/sortedLists',
      tasks: 'task/tasks',
      folders: 'folder/sortedFolders',
      groups: 'group/sortedGroupsByName',
      tags: 'tag/sortedTagsByName',
      fallbackSelected: 'fallbackSelected',

      getTagsByName: 'tag/getTagsByName',
      getTagsById: 'tag/getTagsById',
      getSubTagsByTagId: 'tag/getSubTagsByTagId',
      getListsById: 'list/getListsById',
      getListsByName: 'list/getListsByName',
      getFoldersByName: 'folder/getFoldersByName',
      getFoldersById: 'folder/getFoldersById',
      getGroupsById: 'group/getGroupsById',
      getGroupsByName: 'group/getGroupsByName',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',
      getTasksById: 'task/getTasksById',

      doesTaskPassExclusiveFolders: 'task/doesTaskPassExclusiveFolders',
      doesTaskPassInclusiveFolder: 'task/doesTaskPassInclusiveFolder',
      doesTaskPassExclusiveGroups: 'task/doesTaskPassExclusiveGroups',
      doesTaskPassInclusiveGroup: 'task/doesTaskPassInclusiveGroup',
      doesTaskPassExclusiveLists: 'task/doesTaskPassExclusiveLists',
      doesTaskPassInclusiveList: 'task/doesTaskPassInclusiveList',
      doesTaskPassExclusiveTags: 'task/doesTaskPassExclusiveTags',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      doesTaskPassInclusivePriority: 'task/doesTaskPassInclusivePriority',
      doesTaskPassExclusivePriorities: 'task/doesTaskPassExclusivePriorities',
    }),
    fallbackSelectedTasks() {
      return this.getTasksById(this.fallbackSelected)
    },
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
    showCalendarExtraIcon() {
      return this.allowCalendar && (this.calendarDate || this.viewName === 'Upcoming')
    },
    shortcutsType() {
      if (this.selectedItems.length > 0)
        return this.selectedType
      if (this.tasks.find(t => t.id === this.mainSelection))
        return 'Task'
      return 'List'
    },
    isTaskHandler() {
      return this.getViewComp === 'TaskHandler'
    },
    headerHandle() {
      return 'settings-v'
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
          callback: () => {
            this.inclusiveList = null
            this.exclusiveLists = []
            this.showingListSelection = false
          }
        })
      if (this.showingTagSelection)
        arr.push({
          icon: 'tag',
          callback: () => {
            this.inclusiveTags = []
            this.exclusiveTags = []
            this.showingTagSelection = false
          }
        })
      if (this.showingFolderSelection)
        arr.push({
          icon: 'folder',
          callback: () => {
            this.inclusiveFolder = null
            this.exclusiveFolders = []
            this.showingFolderSelection = false
          }
        })
      if (this.filterByAssigned)
        arr.push({
          icon: 'user',
          callback: () => {
            this.filterByAssigned = false
          }
        })
      if (this.showingGroupSelection)
        arr.push({
          icon: 'group',
          callback: () => {
            this.inclusiveGroup = null
            this.exclusiveGroups = []
            this.showingGroupSelection = false
          }
        })
      if (this.showingPrioritySelection)
        arr.push({
          icon: 'priority',
          callback: () => {
            this.inclusivePriority = null
            this.exclusivePriorities = []
            this.showingPrioritySelection = false
          }
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
      if (this.showCalendarExtraIcon)
        arr.push({
          icon: 'calendar',
          callback: () => this.$store.commit('toggleCalendar', false)
        })
      return arr
    },
    isSearch() {
      return this.isSmart && this.viewNameValue === "Search"
    },
    pipeFilterOptions() {
      const toPipe = []
      const {tags, list, group, folder, priorities} = this.getFilterOptions

      if (tags.inclusive.length > 0)
        toPipe.push(t => this.doesTaskPassInclusiveTags(t, tags.inclusive))
      if (tags.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveTags(t, tags.exclusive))

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

      if (group.inclusive)
        toPipe.push(t => this.doesTaskPassInclusiveGroup(t, group.inclusive))
      if (group.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveGroups(t, group.exclusive))
      
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
         utils.sortListByName(arr) :
        []
    },
    listSelectionOptions() {
      return this.showingListSelection ? utils.sortListByName(this.getListsById(this.presentLists)) : []
    },
    folderSelectionOptions() {
      return this.showingFolderSelection ? utils.sortListByName(this.getFoldersById(this.presentFolders)) : []
    },
    groupSelectionOptions() {
      return this.showingGroupSelection ? utils.sortListByName(this.getGroupsById(this.presentGroups)) : []
    },
    getIconDropOptionsTags() {
      return utils.tagsOptions(this, [], tagIds => {
            this.$store.dispatch('task/addTagsToTasksById', {
              ids: this.selectedItems,
              tagIds,
            })
          }, true)
    },
    getIconDropOptionsFolders() {
      return utils.folderOptions(this, task => {
        if (this.shortcutsType === 'Task')
          this.$store.dispatch('task/saveTasksById', {
            ids: this.selectedItems,
            task,
          })
        else
          this.$store.dispatch('list/saveListsById', {
            ids: this.selectedItems,
            list: task,
          })
      })
    },
    getIconDropOptionsGroups() {
      return utils.groupOptions(this, task => {
        if (this.shortcutsType === 'Task')
          this.$store.dispatch('task/saveTasksById', {
            ids: this.selectedItems,
            task,
          })
        else
          this.$store.dispatch('list/saveListsById', {
            ids: this.selectedItems,
            list: task,
          })
      })
    },
    getViewComp() {
      return this.viewComponent || "TaskHandler"
    },
    getIconDropOptionsLists() {
      return utils.listsOptions(this, task => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedItems,
          task,
        })
      })
    },
    taskIconDropOptions() {
      const dispatch = this.$store.dispatch
      const ids = this.selectedItems

      const savePri = (pri) => {
        dispatch('task/saveTasksById', {ids, task: {priority: pri}})
      }

      const saveDeadline = deadline => {
        if (this.shortcutsType === 'Task')
          this.$store.dispatch('task/saveTasksById', {
            ids,
            task: {
              deadline,
            }
          })
        else
          this.$store.dispatch('list/saveListsById', {
            ids,
            list: {
              deadline,
            },
          })
      }

      const logItems = () => {
        if (this.shortcutsType === "Task")
          this.$store.dispatch('task/logTasks', ids)
        else
          this.$store.dispatch('list/logLists', ids)
      }
      
      let opt
      if (this.shortcutsType === 'Task')
        opt = [
          {
            name: 'Move to logbook',
            icon: 'logbook',
            callback: () => logItems()
          },
          {
            name: 'Move to list',
            icon: 'tasks',
            callback: () => this.getIconDropOptionsLists
          },
          {
            name: 'Move to folder',
            icon: 'folder',
            callback: () => this.getIconDropOptionsFolders
          },
          {
            name: 'Move to group',
            icon: 'group',
            callback: () => this.getIconDropOptionsGroups
          },
          {
            name: 'Add tags',
            icon: 'tag',
            callback: () => this.getIconDropOptionsTags
          },
          {
            type: 'optionsList',
            name: 'Deadline',
            options: [
              {
                icon: 'star',
                id: 'd',
                color: 'var(--yellow)',
                callback: () => saveDeadline(mom().format('Y-M-D')),
              },
              {
                icon: 'sun',
                id: 'çljk',
                color: 'var(--orange)',
                callback: () => saveDeadline(mom().add(1, 'day').format('Y-M-D')),
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                color: 'var(--green)',
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
                color: 'var(--red)',
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
                color: 'var(--yellow)',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'sun',
                id: 'çljk',
                color: 'var(--orange)',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().add(1, 'day').format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'layer-group',
                id: 'asdffds',
                color: 'var(--olive)',
                callback: () => this.saveDates({
                  type: 'anytime',
                }, ids)
              },
              {
                icon: 'archive',
                id: 'açlkjsdffds',
                color: 'var(--brown)',
                callback: () => this.saveDates({
                  type: 'someday',
                }, ids)
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                color: 'var(--green)',
                callback: () => {return {
                  comp: "CalendarPicker",
                  content: {callback: date => this.saveDates(date, ids)}}},
              },
              {
                id: 'No date',
                color: 'var(--red)',
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
      else
        opt = [
          {
            name: 'Log lists',
            icon: 'faded-logged-lists',
            callback: () => logItems()
          },
          {
            name: 'Move to folder',
            icon: 'folder',
            callback: () => this.getIconDropOptionsFolders
          },
          {
            name: 'Move to group',
            icon: 'group',
            callback: () => this.getIconDropOptionsGroups
          },
          {
            type: 'optionsList',
            name: 'Deadline',
            options: [
              {
                icon: 'star',
                id: 'd',
                color: 'var(--yellow)',
                callback: () => saveDeadline(mom().format('Y-M-D')),
              },
              {
                icon: 'sun',
                id: 'çljk',
                color: 'var(--orange)',
                callback: () => saveDeadline(mom().add(1, 'day').format('Y-M-D')),
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                color: 'var(--green)',
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
                color: 'var(--red)',
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
                color: 'var(--yellow)',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'sun',
                id: 'çljk',
                color: 'var(--orange)',
                callback: () => this.saveDates({
                  type: 'specific',
                  specific: mom().add(1, 'day').format('Y-M-D'),
                }, ids),
              },
              {
                icon: 'layer-group',
                id: 'açlkjsdffd',
                color: 'var(--olive)',
                callback: () => this.saveDates({
                  type: 'anytime',
                }, ids)
              },
              {
                icon: 'archive',
                id: 'açlkjsdffds',
                color: 'var(--brown)',
                callback: () => this.saveDates({
                  type: 'someday',
                }, ids)
              },
              {
                icon: 'calendar',
                id: 'çljkasdf',
                color: 'var(--green)',
                callback: () => {return {
                  comp: "CalendarPicker",
                  content: {callback: date => this.saveDates(date, ids)}}},
              },
              {
                id: 'No date',
                icon: 'bloqued',
                color: 'var(--red)',
                callback: () => this.saveDates(null, ids)
              },
            ]
          },
          {
            name: 'Delete lists',
            icon: 'trash',
            important: true,
            callback: () => dispatch('list/deleteMultipleListsByIds', ids)
          },
        ]

      if (((this.viewItem && this.viewItem.group) || (this.viewType === 'group')) && this.viewItem)
        opt.unshift(this.getAssigneeIconDrop({group: this.viewItem.group || this.viewItem.id}, uid => this.assignUser(uid)))
      return opt
    },
    viewRendererOptions() {
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
              name: 'Sort by schedule time',
              icon: 'calendar-star',
              callback: () => this.sortBySchedule(),
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
            {
              name: 'Filter by Groups',
              icon: 'group',
              callback: () => this.toggleGroupSelection()
            },
            {
              name: 'Show only assigned to me',
              icon: 'user',
              callback: () => this.filterByAssigned = !this.filterByAssigned
            }
          ],
        },
        {
          name: 'Show completed',
          icon: 'circle-check',
          callback: () => this.toggleCompleted()
        },
      ]
      if (this.calendarDate)
        opt.splice(opt.length - 1, 0, utils.getAutoSchedulerIconDropObject(obj => this.saveAutoSchedule({obj}), this.userInfo))


      if (!this.allowCalendar && (this.calendarDate || this.viewName === 'Upcoming')) {
        opt.push({
          name: !this.showingRuler ? 'Show timeline ruler' : 'Hide timeline ruler',
          icon: 'clock',
          callback: this.toggleRuler,
        })
        opt.push({
          name: 'Show Google Calendar',
          icon: 'calendar',
          callback: () => this.$store.commit('toggleCalendar', true)
        })
      }
      if (this.computedHeaderOptions && this.computedHeaderOptions.length > 0) {
        opt.push({
          type: 'hr',
          name: 'division',
        })
        opt = [...opt, ...this.computedHeaderOptions]
      }
      return opt
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
        group: {
          inclusive: this.getInclusiveGroupId,
          exclusive: this.getExclusiveGroupsId,
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
    getInclusiveGroupId() {
      if (this.inclusiveGroup)
        return this.getGroupsByName([this.inclusiveGroup])[0].id
      return null
    },
    getExclusiveGroupsId() {
      if (this.exclusiveGroups)
        return this.getGroupsByName(this.exclusiveGroups).map(el => el.id)
      return null
    },
  },
  watch: {
    viewName() {
      this.getComputedOptions()
      this.saveMainSelection(null)
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
  margin: 0 65px;
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
