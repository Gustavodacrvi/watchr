
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import { pipeBooleanFilters, memoize } from '@/utils/memo'
import utils from '@/utils/'
import mom from 'moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewList) {
        this.$store.dispatch('list/addTaskByIndex', {
          ...obj, listId: this.viewList.id,
        })
      }
    },
    rootFallbackTask(task, force) {
      if (force || !task.heading) {
        task.heading = null
      }
      return task
    },
    mainFallbackTask(task, force) {
      if (force || (!task.list && !task.folder))
        task.list = this.viewList.id
      task.tags = [...task.tags, ...this.listgetListTags.map(el => el.id)]
      return task
    },
    
    updateIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
      }
    },
    saveHeaderName(name) {
      if (this.viewList) {
        if (this.getListByName(name))
          this.pushToast({
            name: this.l['This list already exists!'],
            seconds: 4,
            type: 'error',
          })
        else {
          this.$router.push('/user?list='+name)
          this.$store.dispatch('list/saveList', {
            name,
            id: this.viewList.id,
          })
        }
      }
    },
    saveNotes(notes) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          notes, id: this.viewList.id,
        })
      }
    },
    addHeading(obj) {
      if (this.viewList) {
        this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
      }
    },
    onSortableAdd(evt, taskIds, type, ids) {
      if (this.viewList) {
        this.$store.dispatch('list/removeTasksFromHeading', {
          taskIds, ids, listId: this.viewList.id,
        })
      }
    },
    saveList(obj) {
      this.$store.dispatch('list/saveList', {
        ...obj,
        id: this.viewList.id,
      })
    },
    removeDeferDate() {
      this.listsaveList({deferDate: null})
    },
    removeRepeat(val) {
      this.listsaveList({calendar: null})
    },
    removeHeaderTag(tagName) {
      this.$store.dispatch('list/removeListTag', {
        listId: this.viewList.id,
        tagId: this.listgetListTags.find(el => el.name === tagName).id,
      })
    },
    removeDeadline() {
      this.listsaveList({deadline: null})
    },

    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
  },
  computed: {
    mainFilter() {
      if (this.viewList) {
        return task => this.isTaskInList(task, this.viewList.id)
      }
      return () => false
    },
    rootFilter() {
      return this.isTaskInListRoot
    },
    headings() {
      const arr = []
      if (this.viewList) {
        const viewList = this.viewList

        for (const h of viewList.headings) {
          const pipedFilter = task => this.isTaskInHeading(task, h)
          const sort = tasks => this.$store.getters.checkMissingIdsAndSortArr(h.tasks, tasks)

          arr.push({
            name: h.name,
            id: h.name,
            allowEdit: true,
            showHeadingName: false,
            notes: h.notes,
            calendarStr: true,

            onEdit: tasks => name => {
              this.$store.dispatch('list/saveHeadingName', {
                listId: this.viewList.id,
                oldName: h.name,
                newName: name,
                tasksIds: tasks.map(el => el.id),
              })
            },
            sort,
            filter: pipedFilter,
            options: tasks => {
              return utilsList.listHeadingOptions(this.viewList, h, this.$store, tasks, this.l)
            },
            fallbackTask: (task, force) => {
              if (force || (!task.heading && !task.folder && task.list === viewList.id))
                task.heading = h.name
              task.tags = [...task.tags, ...this.listgetListTags.map(el => el.id)]
              return task
            },

            saveNotes: notes => {
              this.$store.dispatch('list/saveHeadingNotes', {
                listId: this.viewList.id, notes, heading: h.name,
              })
            },
            updateIds: ids => {
              this.$store.dispatch('list/updateHeadingsTaskIds', {
                name: h.name, listId: viewList.id, ids,
              })
            },
            onAddTask: obj => {
              this.$store.dispatch('list/addTaskHeading', {
                ...obj, name: obj.header.name, listId: viewList.id,
              })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              this.$store.dispatch('list/moveTasksBetweenHeadings', {
                taskIds, ids, name: h.name, listId: viewList.id,
              })
            }
          })
        }
      }
      return arr
    },
    headingsOrder() {
      if (this.viewList && this.viewList.headingsOrder)
        return this.viewList.headingsOrder
      return []
    },
    
    icon() {return 'tasks'},
    viewNameValue() {return this.viewName},
    updateHeadingIds() {
      if (this.viewList) {
        return ids => {
          this.$store.dispatch('list/updateListHeadings', {
            listId: this.viewList.id,
            ids,
          })
        }
      }
      return null
    },
    taskCompletionCompareDate() {
      return null
    },
    files() {
      if (this.viewList) {
        return {
          id: this.viewList.id,
          storageFolder: 'lists',
          files: this.viewList.files,
        }
      }
      return null
    },
    tasksOrder() {
      if (this.viewList && this.viewList.tasks)
        return this.viewList.tasks
      return []
    },
    showEmptyHeadings() {
      return true
    },
    showAllHeadingsItems() {
      return true
    },
    getListTags() {
      if (this.viewList && this.viewList.tags)
        return this.getTagsById(this.viewList.tags)
      return []
    },
    headerTags() {
      return this.listgetListTags.map(el => el.name)
    },
    headerDates() {
      const obj = {}
      const list = this.viewList
      if (!list) return obj

      obj.defer = list.deferDate
      obj.deadline = list.deadline

      return obj
    },
    headerCalendar() {
      if (this.viewList)
        return this.viewList.calendar
      return null
    },
    headerOptions() {
      if (this.viewList)
        return utilsList.listOptions(this.viewList)
      return null
    },
    headingEditOptions() {
      if (this.viewList)
        return {
          excludeNames: this.viewList.headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
        }
      return null
    },
    getViewNotes() {
      if (this.viewList)
        return this.viewList.notes
      return null
    },
    getPieProgress() {
      if (this.viewList)
        return this.$store.getters['list/pieProgress'](this.tasks, this.viewList.id, this.isTaskCompleted)
      return []
    },
  },
}
