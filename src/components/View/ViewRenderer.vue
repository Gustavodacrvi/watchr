<template>
  <div class="ViewRenderer" :class="platform">
    <div>
      <Header
        :icon="icon"
        :viewName="viewName"
        :viewNameValue="viewNameValue"
        :options="options"
        :viewType="viewType"
        :notes='notes'
        :tags='tagSelectionOptions'
        :lists='listSelectionOptions'
        :progress='progress'
        :activeTags='activeTags'
        :activeList='activeList'
        :isSmart="isSmart"
        @save-header-name='name => $emit("save-header-name", name)'
        @save-notes='notes => $emit("save-notes", notes)'
        @tag='selectTag'
        @list='selectList'
      />
      <TaskRenderer
        :emptyIcon='emptyIcon'
        :tasks='getFilterCompletedTasks'
        :view='viewName'
        :isSmart="isSmart"
        :viewType="viewType"
        :viewNameValue='viewNameValue'
        :showEmptyHeadings='showEmptyHeadings'
        :headings='filteredHeadingsOptions'
        :addTask='addTask'
        :headingEdit='headingEdit'
        :showCompleted='showCompleted'
        :activeTags='getActiveTags'
        :activeList='getActiveListId'
        :illustration='illustration'
        :headingPosition='0'
        :onSortableAdd='onSortableAdd'
        @update="(ids) => $emit('update-ids', ids)"
        @update-headings='(ids) => $emit("update-heading-ids", ids)'
        @add-heading="addHeading"
      />
    </div>
    <transition name="fade-t">
      <div v-if="hideHeadings && hasAutoHideHeadings" @click="hideHeadings = false">
        <span class="show-headings rb cursor">
          Show hided headings...
        </span>
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

import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index.js'
import mom from 'moment'

export default {
  props: ['headingsOptions', 'viewName', 'viewType', 'tasks', 'tasksOrder', 'showHeader', 'headingEdit', 'icon', 'viewNameValue', 'emptyIcon', 'illustration', 'showEmptyHeadings', 'onSortableAdd', 'notes', 'showCompletedOnHeadings', 'isSmart', 'headerOptions', 'progress'],
  components: {
    Header: HeaderVue,
    TaskRenderer: TaskRendererVue,
    ActionButtons: ActionButtonsVue,
  },
  data() {
    return {
      showCompleted: false,
      showingTagSelection: false,
      showingListSelection: false,
      activeTags: [],
      activeList: null,
      hideHeadings: true,
    }
  },
  created() {
    this.showingTagSelection = localStorage.getItem(this.tagSelectionStr) === 'true'
    this.showingListSelection = localStorage.getItem(this.listSelectionStr) === 'true'
  },
  methods: {
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
      this.$emit('add-heading', {...obj, ids: this.headingsOptions.map(el => el.id)})
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
      // TODO
      /* let tasks = this.getTasks.slice()
      tasks = utilsTask.sortTasksByDate(tasks)
      this.updateIds(tasks.map(el => el.id)) */
    },
    toggleCompleted() {
      this.showCompleted = !this.showCompleted
    },
    saveDates(date) {
      this.$store.dispatch('task/saveTasksById', {
        ids: this.selectedTasks,
        task: {calendar: date},
      })
    },
    addTagToTasks(id) {
      this.$store.dispatch('task/addTagsToTasksById', {
        ids: this.selectedTasks,
        tagIds: [id],
      })
    },
    addTask(obj, evt) {
      obj.ids = this.sortAndFilterTasks.map(el => el.id)
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
      savedLists: state => state.list.lists,
      viewOrders: state => state.list.viewOrders,
      selectedTasks: state => state.selectedTasks,
    }),
    ...mapGetters({
      platform: 'platform',
      isDesktop: 'isDesktop',
      l: 'l',
      savedTags: 'tag/sortedTagsByFrequency',
    }),
    hasAutoHideHeadings() {
      const hs = this.headingsOptions
      return hs.length > 0 && hs.some(el => el.autoHide)
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
    getIconDropOptionsLists() {
      const moveToList = (obj) => {
        this.$store.dispatch('task/saveTasksById', {
          ids: this.selectedTasks,
          task: {...obj},
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
                name: l['Sort by date'],
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
          {
            name: l['Hide autohide headings'],
            icon: 'archive',
            callback: () => this.hideHeadings = true
          }
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
            name: l['Change date'],
            icon: 'calendar',
            callback: () => {return {calendar: true, callback: this.saveDates}}
          },
          {
            name: l['Add tags'],
            icon: 'tag',
            callback: () => {return {
              search: true,
              links: this.getIconDropOptionsTags,
            }}
          },
          {
            name: l['Add tasks to list'],
            icon: 'tasks',
            callback: () => {return {
              search: true,
              links: this.getIconDropOptionsLists,
            }}
          },
          {
            name: l['Remove tasks from list'],
            icon: 'tasks',
            callback: () => this.removeTasksFromLists(),
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
      let ts = this.tasks
      const order = this.tasksOrder

      if (order)
        ts = utils.checkMissingIdsAndSortArr(order, ts)
      else
        ts = utilsTask.sortTasksByPriority(ts)

      return utilsTask.filterTasksByViewRendererFilterOptions(ts, this.getActiveTagIds, this.getActiveListId)
    },
    getFilterCompletedTasks() {
      let ts = this.sortAndFilterTasks
      let notCompleted = []
      if (this.showCompleted) return ts
      
      notCompleted = utilsTask.filterTasksByCompletion(ts, true)

      if (notCompleted.length === 0)
        return ts.filter(task => {
          if (!task.calendar) return true
          return task.calendar.type === 'specific'
        })

      return notCompleted
    },
    filteredHeadingsOptions() {
      if (this.hideHeadings)
        return this.headingsOptions.filter(el => !el.autoHide)
      return this.headingsOptions
    },
  },
  watch: {
    headingsOptions() {
      this.hideHeadings = true
    }
  }
}

</script>

<style scoped>

.show-headings {
  display: inline-block;
  margin-top: 8px;
  padding: 10px;
  color: var(--gray);
  background-color: var(--back-color);
  transform: scale(1,1);
  transition-duration: .2s;
}

.show-headings:hover {
  background-color: var(--dark);
}

.show-headings:active {
  transform: scale(.9,.9);
}

.ViewRenderer {
  margin: 0 90px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.ViewRenderer.mobile {
  margin: 0 8px;
}

</style>
