
<template>
  <div class="ViewRenderer"
    :class="platform"

    @touchend.passive='touchend'
    @touchstart.passive='touchstart'
    @touchmove.passive='touchmove'
  >
    <div>
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
        :priorities='priorityOptions'
        :lists='listSelectionOptions'
        :folders='folderSelectionOptions'

        :viewName="viewName"
        :options="taskIconDropOptions"
        :headerTags="headerTags"

        @tag='selectTag'
        @priority='selectPriority'
        @list='selectList'
        @folder='selectFolder'
      />
      <div class="handler-wrapper">
        <TaskHandler class='view-renderer-move'
          v-bind="$props"

          :headings="getHeadings"
          :showCompleted='showCompleted'
          :showSomeday='passSomedayTasks'
          :pipeFilterOptions='pipeFilterOptions'
          :taskIconDropOptions='taskIconDropOptions'
          :updateHeadingIds='updateHeadingIds'
          :autoSchedule='autoSchedule'

          @allow-someday='showSomeday = true'
          @root-non-filtered='getRootNonFilteredFromTaskHandler'
        />
      </div>
    </div>
    <PaginationVue v-if="headingsPagination"
      :page='pagination'
      :numberOfPages='getNumberOfPages'
      @select='selectPagination'
    />
    <div style="height: 500px"></div>
    <ActionButtons :showHeader='showHeadadingFloatingButton'/>
  </div>
</template>

<script>

import HeaderVue from './Headings/Header.vue'
import ActionButtonsVue from './FloatingButtons/ActionButtons.vue'
import PaginationVue from './Pagination.vue'
import TaskHandler from './TaskHandler.vue'

import { mapGetters, mapState, mapActions } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment/src/moment'

import { pipeBooleanFilters } from '@/utils/memo'

const MAXIMUM_TOUCH_DISTANCE = 100
const MINIMUM_DISTANCE = 20

export default {
  props: ['viewName', 'viewType', 'isSmart', 'viewNameValue',

  'headingEditOptions', 'showEmptyHeadings', 'icon', 'notes',
  'headerOptions', 'headerDates', 'headerTags', 'headerCalendar', 'files',
  'progress', 'tasksOrder',  'rootFallbackTask', 'mainFallbackTask',
  
  'mainFilter', 'rootFilter' ,'headings', 'headingsOrder', 'onSortableAdd',  'showHeadadingFloatingButton', 'updateHeadingIds', 'showAllHeadingsItems', 'taskCompletionCompareDate', 'headingsPagination', 'configFilterOptions'],
  components: {
    PaginationVue, TaskHandler,
    Header: HeaderVue,
    ActionButtons: ActionButtonsVue,
  },
  data() {
    return {
      pagination: 0,
      showCompleted: false,
      showingTagSelection: false,
      showingListSelection: false,
      showingFolderSelection: false,
      showingPrioritySelection: false,
      showSomeday: false,

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
    }
  },
  created() {
    this.getComputedOptions()
  },
  mounted() {
    this.getComputedOptions()
  },
  methods: {
    ...mapActions(['getOptions']),

    transform(x, transition) {
      const s = this.el

      const getOpacity = () => 1.4 - (Math.abs(x) / MAXIMUM_TOUCH_DISTANCE)
      
      if (!transition) {
        s.transitionDuration = '0s'
        s.left = `${x}px`
        s.opacity = getOpacity()
      } else {
        s.transitionDuration = '.2s'
        setTimeout(() => {
          s.left = `${x}px`
          s.opacity = getOpacity()
        }, 10)
      }
    },
    touchmove(evt) {
      this.move = true
      if (!this.touchFail) {
        const t = evt.touches[0]
        this.diffX = t.screenX - this.initialX
        this.diffY = t.screenY - this.initialY

        const x = Math.abs(this.diffX)

        if ((Math.abs(this.diffY) > 20)) {
          this.touchFail = true
          this.transform(0, true)
        } else {
          this.transform(this.diffX)

          if (x > MINIMUM_DISTANCE) {
            this.right = this.diffX > 0
          }
        }
      }
    },
    touchstart(evt) {
      const t = evt.touches[0]
      this.initialX = t.screenX
      this.initialY = t.screenY

      this.touchFail = false
      this.startTime = new Date()
      this.move = false
    },
    touchend() {
      this.transform(0, true)

      const time = new Date() - this.startTime

      if (this.move && Math.abs(this.diffX) > MINIMUM_DISTANCE && time <= 350 && !this.touchFail) {
        if (this.right) this.$emit('slide', -1)
        else this.$emit('slide', 1)
      }
    },
    
    async getComputedOptions() {
      if (this.headerOptions)
        this.computedHeaderOptions = await this.getOptions(this.headerOptions)
    },
    activeAutoSchedule(info) {
      this.autoSchedule = info
      localStorage.setItem(`schedule_${this.viewName}`, JSON.stringify(info))
    },
    getLocalStorageSchedule() {
      const str = localStorage.getItem(`schedule_${this.viewName}`)
      if (str)
        this.autoSchedule = JSON.parse(str)
      else this.autoSchedule = null
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
        ids: this.selectedTasks,
        tagIds: [id],
      })
    },
    removeTasksFromLists() {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedTasks,
        task: {list: ''},
      })
    },
  },
  computed: {
    ...mapState({
      viewOrders: state => state.list.viewOrders,
      selectedTasks: state => state.selectedTasks,
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      platform: 'platform',
      isDesktop: 'isDesktop',
      l: 'l',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',

      doesTaskPassExclusiveFolders: 'task/doesTaskPassExclusiveFolders',
      doesTaskPassInclusiveFolder: 'task/doesTaskPassInclusiveFolder',
      doesTaskPassExclusiveLists: 'task/doesTaskPassExclusiveLists',
      doesTaskPassInclusiveList: 'task/doesTaskPassInclusiveList',
      doesTaskPassExclusiveTags: 'task/doesTaskPassExclusiveTags',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      doesTaskPassInclusivePriority: 'task/doesTaskPassInclusivePriority',
      doesTaskPassExclusivePriorities: 'task/doesTaskPassExclusivePriorities',
    }),
    el() {
      const el = this.$el.getElementsByClassName('view-renderer-move')[0]
      return el.style
    },
    isSearch() {
      return this.isSmart && this.viewNameValue === "Search"
    },
    pipeFilterOptions() {
      const toPipe = []
      const {tags, list, folder, priorities} = this.getFilterOptions

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
    sliceNumber() {
      return this.isDesktop ? 8 : 4
    },
    tagSelectionOptions() {
      return this.showingTagSelection ? this.savedTags.slice(0, this.sliceNumber) : []
    },
    listSelectionOptions() {
      return this.showingListSelection ? this.savedLists.slice(0, this.sliceNumber) : []
    },
    folderSelectionOptions() {
      return this.showingFolderSelection ? this.savedFolders.slice(0, this.sliceNumber) : []
    },
    getIconDropOptionsTags() {
      const arr = []
      for (const t of this.savedTags) {
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
          ids: this.selectedTasks,
          task: {...obj, folder: null},
        })
      }
      const links = []
      for (const fold of this.savedFolders) {
        links.push({
          name: fold.name,
          icon: 'folder',
          callback: () => {
            this.$store.dispatch('task/saveTasksById', {
              ids: this.selectedTasks,
              task: {folder: fold.id, list: null},
            })
          },
        })
      }
      return links
    },
    getIconDropOptionsLists() {
      const moveToList = (obj) => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedTasks,
          task: {...obj, folder: null},
        })
      }
      const links = []
      for (const list of this.savedLists) {
        links.push({
          name: list.name,
          icon: 'tasks',
          callback: () => {
            const arr = [{
              name: this.l['List root'],
              callback: () => moveToList({list: list.id, heading: null})
            }]
            for (const h of list.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => moveToList({list: list.id, heading: h.name})
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
      const ids = this.selectedTasks

      const savePri = (pri) => {
        dispatch('task/saveTasksById', {ids, task: {priority: pri}})
      }
      const l = this.l

      const formatTime = time => mom(time, 'HH:mm').format(this.userInfo.disablePmFormat ? 'HH:mm' : 'LT')

      const getScheduleIconDropObject = info => {
        if (!info)
            info = {time: mom().format('HH:mm'), buffer: '00:05', fallback: '00:15'}
        
        const {time, buffer, fallback} = info

        return [
          {
            name: `${l['Start from:']} <span class="fade">${formatTime(time)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                msg: l['Start from:'],
                callback: newTime => getScheduleIconDropObject({
                  time: newTime, buffer, fallback,
                })
              }
            })
          },
          {
            name: `${l['Buffer time:']} <span class="fade">${utils.formatQuantity(buffer)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: l["Buffer time:"],
                callback: newBuffer => getScheduleIconDropObject({
                  time, buffer: newBuffer, fallback,
                })
              }
            })
          },
          {
            name: `${l['Fallback time:']} <span class="fade">${utils.formatQuantity(fallback)}</span>`,
            callback: () => ({
              comp: 'TimePicker',
              content: {
                format: '24hr',
                msg: l["Buffer time:"],
                callback: newFallback => getScheduleIconDropObject({
                  time, buffer, fallback: newFallback,
                })
              }
            })
          },
          {
            name: l['Auto schedule'],
            callback: () => {
              this.activeAutoSchedule({...info})
              return null
            },
            type: 'button',
          },
        ]
      }
      
      if (ids.length === 0) {
        let opt = [
          {
            name: l['Sort tasks'],
            icon: 'sort',
            callback: () => [
              {
                name: l['Sort by name'],
                icon: 'sort-name',
                callback: () => this.sortByName()
              },
              {
                name: l['Sort by priority'],
                icon: 'priority',
                callback: () => this.sortByPriority()
              },
              {
                name: l['Sort by creation date'],
                icon: 'calendar',
                callback: () => this.sortByDate(),
              },
              {
                name: l['Sort by duration(long to short)'],
                icon: 'magic',
                callback: () => this.sortByDurationLong()
              },
              {
                name: l['Sort by duration(short to long)'],
                icon: 'magic',
                callback: () => this.sortByDurationShort()
              },
            ],
          },
          {
            name: l['Filter tasks'],
            icon: 'filter',
            callback: () => [
              {
                name: l['Filter by tags'],
                icon: 'tag',
                callback: () => this.toggleTagSelection()
              },
              {
                name: l['Filter by priority'],
                icon: 'priority',
                callback: () => this.togglePrioritySelection()
              },
              {
                name: l['Filter by lists'],
                icon: 'tasks',
                callback: () => this.toggleListSelection()
              },
              {
                name: l['Filter by folders'],
                icon: 'folder',
                callback: () => this.toggleFolderSelection()
              },
            ],
          },
          {
            name: l['Auto schedule'],
            icon: 'magic',
            callback: () => {
              if (this.autoSchedule)
                return [
                  {
                    name: l['Remove schedule'],
                    callback: () => this.activeAutoSchedule(null)
                  },
                  {
                    name: l['Edit schedule'],
                    callback: () => getScheduleIconDropObject(this.autoSchedule)
                  }
                ]
              return getScheduleIconDropObject(null)
            }
          },
          {
            name: l['Show completed'],
            icon: 'circle-check',
            callback: () => this.toggleCompleted()
          },
        ]
        if (this.showCompleted) opt[3].name = l['Hide completed']
        if (this.computedHeaderOptions && this.computedHeaderOptions.length > 0) {
          opt.push({
            type: 'hr',
            name: 'division',
          })
          opt = [...opt, ...this.computedHeaderOptions]
        }
        return opt
      } else {
        return [
          {
            name: l['No date'],
            icon: 'bloqued',
            callback: () => this.saveDates(null, ids)
          },
          {
            type: 'optionsList',
            name: l['Schedule'],
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
            ]
          },
          {
            type: 'optionsList',
            name: l['Priority'],
            options: [
              {
                icon: 'priority',
                id: 'd',
                color: 'var(--gray)',
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
            name: l['More options'],
            icon: 'settings-h',
            callback: () => [
              {
                name: l['Repeat task'],
                icon: 'repeat',
                callback: () => [
                  {
                    name: l['Repeat weekly'],
                    icon: 'repeat',
                    callback: () => ({
                      comp: 'WeeklyPicker',
                      content: {callback: date => this.saveDates(date, ids)},
                    }),
                  },
                  {
                    name: l['Repeat periodically'],
                    icon: 'repeat',
                    callback: () => ({
                      comp: 'PeriodicPicker',
                      content: {callback: date => this.saveDates(date, ids)},
                    }),
                  },
                ],
              },
              {
                name: l['Move to list'],
                icon: 'tasks',
                callback: () => {return {
                  allowSearch: true,
                  links: this.getIconDropOptionsLists,
                }}
              },
              {
                name: l['Move to folder'],
                icon: 'folder',
                callback: () => {return {
                  allowSearch: true,
                  links: this.getIconDropOptionsFolders,
                }}
              },
              {
                name: l['Delete task'],
                icon: 'trash',
                important: true,
                callback: () => dispatch('task/deleteTasks', ids)
              }
            ]
          },
        ]
      }
    },
    getNumberOfPages() {
      return Math.floor(this.headings.length / this.headingsPagination)
    },
    getHeadings() {
      if (!this.headingsPagination) return this.headings
      const num = this.headingsPagination
      const page = this.pagination
      const init = (page * num)

      return this.headings.slice(init, init + num)
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
      return this.$store.getters['tag/getTagsByName'](this.inclusiveTags).map(el => el.id)
    },
    getExclusiveTagIds() {
      return this.$store.getters['tag/getTagsByName'](this.exclusiveTags).map(el => el.id)
    },
    getInclusiveListId() {
      if (this.inclusiveList)
        return this.$store.getters['list/getListsByName']([this.inclusiveList])[0].id
      return null
    },
    getExclusiveListsId() {
      if (this.exclusiveLists)
        return this.$store.getters['list/getListsByName'](this.exclusiveLists).map(el => el.id)
      return null
    },
    getInclusiveFolderId() {
      if (this.inclusiveFolder)
        return this.$store.getters['folder/getFoldersByName']([this.inclusiveFolder])[0].id
      return null
    },
    getExclusiveFoldersId() {
      if (this.exclusiveFolders)
        return this.$store.getters['folder/getFoldersByName'](this.exclusiveFolders).map(el => el.id)
      return null
    },
  },
  watch: {
    viewName() {
      this.showingTagSelection = false
      this.showingListSelection = false
      this.showingFolderSelection = false
      this.getComputedOptions()
      this.autoSchedule = null
      this.getLocalStorageSchedule()
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
  margin: 0 100px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ViewRenderer.mobile {
  margin: 0 8px;
  margin-top: -4px;
}

.handler-wrapper {
  overflow: hidden;
}

.view-renderer-move {
  position: relative;
}

</style>
