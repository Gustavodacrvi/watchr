
<template>
  <div class="ViewRenderer" :class="platform">
    <div>
      <Header
        v-bind="$props"

        :viewName="viewName"
        :options="options"
        :tags='tagSelectionOptions'
        :lists='listSelectionOptions'
        :activeTags='activeTags'
        :activeList='activeList'
        :headerTags="headerTags"
        @save-header-name='name => $emit("save-header-name", name)'
        @save-notes='notes => $emit("save-notes", notes)'
        @tag='selectTag'
        @list='selectList'
        @remove-defer-date='$emit("remove-defer-date")'
        @remove-deadline='$emit("remove-deadline")'
        @remove-repeat='$emit("remove-repeat")'
        @remove-header-tag="tagName => $emit('remove-header-tag', tagName)"
      />
      <TaskRenderer
        v-bind="$props"

        :tasks='getFilterCompletedTasks'
        :viewName='viewName'
        :headings='getHeadings'
        :addTask='addTask'
        :headingEdit='headingEdit'
        :showCompleted='showCompleted'
        :activeTags='getActiveTags'
        :options='options'
        :activeList='getActiveListId'
        :headingPosition='0'
        @update="updateIds"
        @update-headings='(ids) => $emit("update-heading-ids", ids)'
        @add-heading="addHeading"
      />
    </div>
    <PaginationVue v-if="headingsPagination"
      :page='pagination'
      :numberOfPages='getNumberOfPages'
      @select='selectPagination'
    />
    <transition name="fade-t">
      <div v-if="hasAtLeastOneSomeday && !showSomeday && !isSearch && !isSomeday" @click="showSomeday = true">
        <AppButton type="dark" :value="l['Show someday tasks...']"/>
      </div>
    </transition>
    <div style="height: 500px"></div>
    <ActionButtons :showHeader='showHeader'/>
  </div>
</template>

<script>

import HeaderVue from './Headings/Header.vue'
import TaskRendererVue from './Tasks/TaskRenderer.vue'
import ActionButtonsVue from './FloatingButtons/ActionButtons.vue'
import ButtonVue from '../Auth/Button.vue'
import PaginationVue from './Pagination.vue'

import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment/src/moment'

export default {
  props: ['headingsOptions', 'viewName', 'viewType', 'tasks', 'tasksOrder', 'showHeader', 'headingEdit', 'icon', 'viewNameValue', 'emptyIcon', 'illustration', 'showEmptyHeadings', 'onSortableAdd', 'notes', 'showCompletedOnHeadings', 'isSmart', 'headerOptions', 'progress', 'prefix',
  'headerDates', 'headerTags', 'headerCalendar', 'files', 'taskCompletionCompareDate', 'headingsPagination'],
  components: {
    PaginationVue,
    Header: HeaderVue,
    TaskRenderer: TaskRendererVue,
    ActionButtons: ActionButtonsVue,
    AppButton: ButtonVue,
  },
  data() {
    return {
      pagination: 0,
      showCompleted: false,
      showingTagSelection: false,
      showingListSelection: false,
      activeTags: [],
      activeList: null,
      showSomeday: false,
    }
  },
  created() {
    this.showingTagSelection = localStorage.getItem(this.tagSelectionStr) === 'true'
    this.showingListSelection = localStorage.getItem(this.listSelectionStr) === 'true'
  },
  methods: {
    selectPagination(newPage) {
      this.pagination = newPage
    },
    selectTag(name) {
      if (this.activeTags.includes(name)) {
        const i = this.activeTags.findIndex(el => el === name)
        this.activeTags.splice(i, 1)
      }
      else this.activeTags.push(name)
    },
    selectList(name) {
      if (this.activeList === name) this.activeList = ''
      else this.activeList = name
    },
    toggleTagSelection() {
      this.showingTagSelection = !this.showingTagSelection
      localStorage.setItem(this.tagSelectionStr, this.showingTagSelection)
      this.activeTags = []
    },
    toggleListSelection() {
      this.showingListSelection = !this.showingListSelection
      localStorage.setItem(this.listSelectionStr, this.showingListSelection)
      this.activeLists = ''
    },
    addHeading(obj) {
      this.$emit('add-heading', {...obj})
    },
    updateIds(ids) {
      const notFilteredIds = this.notFilteredIds
      const removedIncludedIds = notFilteredIds.slice().filter(id => !ids.includes(id))

      const final = []
      let missing = []
      let i = 0
      for (const id of notFilteredIds) {
        if (removedIncludedIds.includes(id))
          final.push(id)
        else missing.push(i)

        i++
      }
      i = 0
      for (const id of ids) {
        removedIncludedIds.splice(missing[i], 0, id)
        i++
      }

      
      this.$emit('update-ids', removedIncludedIds)
    },

    sortByName() {
      const tasks = this.tasks.slice()
      tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      this.updateIds(tasks.map(el => el.id))
    },
    sortByPriority() {
      let tasks = this.tasks.slice()
      tasks = utilsTask.sortTasksByPriority(tasks)
      this.updateIds(tasks.map(el => el.id))
    },
    sortByDate() {
      let tasks = this.tasks.slice()
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
    addTask(obj, evt) {
      const notFilteredIds = this.notFilteredIds

      let fixPosition = 0
      let i = 0
      for (const id of notFilteredIds) {
        if (!obj.ids.includes(id))
          fixPosition++
        if ((i - fixPosition) === obj.index) break
        i++
      }

      obj.index += fixPosition
      obj.ids = notFilteredIds
      this.$emit('add-task', obj)
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
      filterTasksByCompletion: 'task/filterTasksByCompletion',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',
    }),
    notFilteredIds() {
      return this.sortAndFilterTasks.map(el => el.id)
    },
    isSearch() {
      return this.isSmart && this.viewNameValue === "Search"
    },
    isSomeday() {
      return this.isSmart && this.viewName === 'Someday'
    },
    getActiveTags() {
      const arr = this.activeTags.slice()
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
    getActiveTagIds() {
      return this.$store.getters['tag/getTagsByName'](this.activeTags).map(el => el.id)
    },
    getActiveListId() {
      if (this.activeList)
        return this.$store.getters['list/getListsByName']([this.activeList])[0].id
      return null
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
    options() {
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
    sortAndFilterTasks() {
      let ts = this.tasks.slice()
      const order = this.tasksOrder

      if (order)
        ts = utils.checkMissingIdsAndSortArr(order, ts)
      else
        ts = utilsTask.sortTasksByPriority(ts)

      return utilsTask.filterTasksByViewRendererFilterOptions(ts, this.getActiveTagIds, this.getActiveListId)
    },
    hasAtLeastOneSomeday() {
      let ts = this.tasks.slice()
      for (const t of ts) {
        if (t.calendar && t.calendar.type === 'someday') {
          return true
        }
      }
      return false
    },
    getFilterBySomeday() {
      let ts = this.sortAndFilterTasks.slice()
      if (this.isSomeday || this.showSomeday || this.isSearch) return ts

      const arr = []
      for (const t of ts)
        if (!t.calendar || t.calendar.type !== 'someday')
          arr.push(t)

      return arr
    },
    getNumberOfPages() {
      return Math.floor(this.headingsOptions.length / this.headingsPagination)
    },
    getHeadings() {
      if (!this.headingsPagination) return this.headingsOptions
      const num = this.headingsPagination
      const page = this.pagination
      const init = (page * num)

      return this.headingsOptions.slice(init, init + num)
    },
    getFilterCompletedTasks() {
      let ts = this.getFilterBySomeday.slice()
      let notCompleted = []
      if (this.showCompleted) return ts
      
      notCompleted = this.filterTasksByCompletion(ts, true)

      if (notCompleted.length === 0 && this.headingsOptions.length === 0)
        return ts.filter(task => {
          if (!task.calendar) return true
          const type = task.calendar.type
          return type === 'specific' || type === 'someday'
        })

      return notCompleted
    },
  },
  watch: {
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
