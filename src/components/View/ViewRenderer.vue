
<template>
  <div class="ViewRenderer" :class="platform">
    <div>
      <Header
        v-bind="$props"

        :inclusiveTags='inclusiveTags'
        :exclusiveTags='exclusiveTags'
        :inclusiveList='inclusiveList'
        :exclusiveList='exclusiveList'
        :inclusiveFolder='inclusiveFolder'
        :exclusiveFolder='exclusiveFolder'

        :tags='tagSelectionOptions'
        :lists='listSelectionOptions'
        :folders='folderSelectionOptions'

        :viewName="viewName"
        :options="taskIconDropOptions"
        :headerTags="headerTags"

        @tag='selectTag'
        @list='selectList'
        @folder='selectFolder'
      />
      <TaskHandler
        v-bind="$props"

        :headings="getHeadings"
        :showCompleted='passCompletedTasks'
        :showSomeday='passSomedayTasks'
        :pipeFilterOptions='pipeFilterOptions'
        :taskIconDropOptions='taskIconDropOptions'
        :updateHeadingIds='updateHeadingIds'

        @allow-someday='showSomeday = true'
        @root-non-filtered='getRootNonFilteredFromTaskHandler'
      />
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

import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment/src/moment'

import { pipeBooleanFilters } from '@/utils/memo'

export default {
  props: ['viewName', 'viewType', 'isSmart', 'viewNameValue',

  'headingEditOptions', 'showEmptyHeadings', 'icon', 'notes',
  'headerOptions', 'headerDates', 'headerTags', 'headerCalendar', 'files',
  'progress', 'tasksOrder',  'rootFallbackTask', 'mainFallbackTask',
  
  'mainFilter', 'rootFilter' ,'headings', 'headingsOrder', 'onSortableAdd',  'showHeadadingFloatingButton', 'updateHeadingIds', 'showAllHeadingsItems', 'taskCompletionCompareDate', 'headingsPagination'],
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
      showSomeday: false,

      rootNonFiltered: [],

      inclusiveTags: [],
      exclusiveTags: [],
      inclusiveList: null,
      exclusiveList: null,
      inclusiveFolder: null,
      exclusiveFolder: null,
    }
  },
  methods: {
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
    selectList(name) {
      this.inclusiveFolder = null
      this.exclusiveFolder = null
      if (this.inclusiveList !== name && this.exclusiveList !== name) {
        this.inclusiveList = name
      } else if (this.inclusiveList === name) {
        this.inclusiveList = null
        this.exclusiveList = name
      } else this.exclusiveList = null
    },
    selectFolder(name) {
      this.inclusiveList = null
      this.exclusiveList = null
      if (this.inclusiveFolder !== name && this.exclusiveFolder !== name) {
        this.inclusiveFolder = name
      } else if (this.inclusiveFolder === name) {
        this.inclusiveFolder = null
        this.exclusiveFolder = name
      } else this.exclusiveFolder = null
    },
    toggleTagSelection() {
      this.showingTagSelection = !this.showingTagSelection
      this.inclusiveTags = []
      this.exclusiveTags = []
    },
    toggleListSelection() {
      this.showingListSelection = !this.showingListSelection
      this.inclusiveLists = ''
      this.exclusiveList = ''
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
      let tasks = this.rootNonFiltered.slice()
      tasks = utilsTask.sortTasksByTaskDate(tasks)
      this.updateIds(tasks.map(el => el.id))
    },

    toggleCompleted() {
      this.showCompleted = !this.showCompleted
    },
    saveDates(calendar) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedTasks,
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
    }),
    ...mapGetters({
      platform: 'platform',
      isDesktop: 'isDesktop',
      l: 'l',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      filterTasksByCompletion: 'task/filterTasksByCompletion',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',

      doesTaskPassExclusiveFolder: 'task/doesTaskPassExclusiveFolder',
      doesTaskPassInclusiveFolder: 'task/doesTaskPassInclusiveFolder',
      doesTaskPassExclusiveList: 'task/doesTaskPassExclusiveList',
      doesTaskPassInclusiveList: 'task/doesTaskPassInclusiveList',
      doesTaskPassExclusiveTags: 'task/doesTaskPassExclusiveTags',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
    }),
    isSearch() {
      return this.isSmart && this.viewNameValue === "Search"
    },
    pipeFilterOptions() {
      const toPipe = []
      const {tags, list, folder} = this.getFilterOptions

      if (tags.inclusive.length > 0)
        toPipe.push(t => this.doesTaskPassInclusiveTags(t, tags.inclusive))
      if (tags.exclusive.length > 0)
        toPipe.push(t => this.doesTaskPassExclusiveTags(t, tags.exclusive))

      if (list.inclusive)
        toPipe.push(t => this.doesTaskPassInclusiveList(t, list.inclusive))
      if (list.exclusive)
        toPipe.push(t => this.doesTaskPassExclusiveList(t, list.exclusive))

      if (folder.inclusive)
        toPipe.push(t => this.doesTaskPassInclusiveFolder(t, folder.inclusive))
      if (folder.exclusive)
        toPipe.push(t => this.doesTaskPassExclusiveFolder(t, folder.exclusive))
      
      if (toPipe.length > 0) {
        return pipeBooleanFilters(...toPipe)
      }
      return () => true
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
              }
            ],
          },
          {
            name: l['Show tag selection'],
            icon: 'tag',
            callback: () => this.toggleTagSelection()
          },
          {
            name: l['Show list selection'],
            icon: 'tasks',
            callback: () => this.toggleListSelection()
          },
          {
            name: l['Show folder selection'],
            icon: 'folder',
            callback: () => this.toggleFolderSelection()
          },
          {
            name: l['Show completed'],
            icon: 'circle-check',
            callback: () => this.toggleCompleted()
          },
        ]
        if (this.showCompleted) opt[3].name = l['Hide completed']
        if (this.headerOptions && this.headerOptions.length > 0) {
          opt.unshift({
            type: 'hr',
            name: 'division',
          })
          opt = [...this.headerOptions, ...opt]
        }
        return opt
      } else {
        return [
          {
            name: l['No date'],
            icon: 'bloqued',
            callback: () => this.saveDates(null)
          },
          {
            name: l['Someday'],
            icon: 'archive',
            callback: () => this.saveDates({type: 'someday'})
          },
          {
            name: l['More dates'],
            icon: 'calendar',
            callback: () => [{
              name: l['Specific day'],
              icon: 'calendar',
              callback: () => {return {
                comp: 'CalendarPicker',
                content: {callback: this.saveDates}}},
            },
            {
              name: l['Repeat weekly'],
              icon: 'repeat',
              callback: () => ({
                comp: 'WeeklyPicker',
                content: {callback: this.saveDates},
              }),
            },
            {
              name: l['Repeat periodically'],
              icon: 'repeat',
              callback: () => ({
                comp: 'PeriodicPicker',
                content: {callback: this.saveDates},
              }),
            }],
          },
          {
            type: 'hr',
            name: 'division',
          },
          {
            name: l['Add tags'],
            icon: 'tag',
            callback: () => {return {
              allowSearch: true,
              links: this.getIconDropOptionsTags,
            }}
          },
          {
            icon: 'priority',
            name: l['Change priority of tasks'],
            callback: () => [
              {
                name: 'No priority',
                icon: 'priority',
                callback: () => savePri('')
              },
              {
                name: 'Low priority',
                icon: 'priority',
                color: 'var(--green)',
                callback: () => savePri('Low priority')
              },
              {
                name: 'Medium priority',
                icon: 'priority',
                color: 'var(--yellow)',
                callback: () => savePri('Medium priority')
              },
              {
                name: 'High priority',
                icon: 'priority',
                color: 'var(--red)',
                callback: () => savePri('High priority')
              }
            ]
          },
          {
            name: l['Add tasks to folder'],
            icon: 'folder',
            callback: () => {return {
              allowSearch: true,
              links: this.getIconDropOptionsFolders,
            }}
          },
          {
            name: l['Add tasks to list'],
            icon: 'tasks',
            callback: () => {return {
              allowSearch: true,
              links: this.getIconDropOptionsLists,
            }}
          },
          {
            name: l['Delete tasks'],
            icon: 'trash',
            important: true,
            callback: () => dispatch('task/deleteTasks', ids)
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
        list: {
          inclusive: this.getInclusiveListId,
          exclusive: this.getExclusiveListId,
        },
        folder: {
          inclusive: this.getInclusiveFolderId,
          exclusive: this.getExclusiveFolderId,
        },
      }
    },
    passCompletedTasks() {
      return this.showCompleted || this.viewName === 'Someday'
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
    getExclusiveListId() {
      if (this.exclusiveList)
        return this.$store.getters['list/getListsByName']([this.exclusiveList])[0].id
      return null
    },
    getInclusiveFolderId() {
      if (this.inclusiveFolder)
        return this.$store.getters['folder/getFoldersByName']([this.inclusiveFolder])[0].id
      return null
    },
    getExclusiveFolderId() {
      if (this.exclusiveFolder)
        return this.$store.getters['folder/getFoldersByName']([this.exclusiveFolder])[0].id
      return null
    },
  },
  watch: {
    viewName() {
      this.showingTagSelection = false
      this.showingListSelection = false
      this.showingFolderSelection = false
    },
    viewNameValue() {
      this.showSomeday = false
    },
  }
}

</script>

<style scoped>

.ViewRenderer {
  margin: 0 90px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ViewRenderer.mobile {
  margin: 0 8px;
  margin-top: -4px;
}

</style>
