
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import { pipeBooleanFilters, memoize } from '@/utils/memo'
import utils from '@/utils/'
import mom from 'moment'

export default {
  computed: {
    addTask() {
      return obj => {
        if (this.viewList) {
          this.$store.dispatch('list/addTaskByIndex', {
            ...obj, listId: this.viewList.id,
          })
        }
      }
    },
    rootFallbackItem() {
      return (task, force) => {
        if (force || !task.heading) {
          task.heading = null
        }
        return task
      }
    },
    mainFallbackItem() {
      return (task, force) => {
        if (force || (!task.list && !task.folder))
          task.list = this.viewList.id
        task.tags = [...task.tags || [], ...this.listgetListTags.map(el => el.id)]
        return task
      }
    },
    
    updateIds() {
      return ids => {
        if (this.viewList) {
          this.$store.dispatch('list/saveList', {
            tasks: ids,
            id: this.viewList.id,
          })
        }
      }
    },
    saveHeaderName() {
      return name => {
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
      }
    },
    saveNotes() {
      return notes => {
        if (this.viewList) {
          this.$store.dispatch('list/saveList', {
            notes, id: this.viewList.id,
          })
        }
      }
    },
    addHeading() {
      return obj => {
        if (this.viewList) {
          this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
        }
      }
    },
    onSortableAdd() {
      return (evt, taskIds, type, ids) => {
        if (this.viewList) {
          this.$store.dispatch('list/removeTasksFromHeading', {
            taskIds, ids, listId: this.viewList.id,
          })
        }
      }
    },
    saveList() {
      return obj => {
        this.$store.dispatch('list/saveList', {
          ...obj,
          id: this.viewList.id,
        })
      }
    },
    removeDeferDate() {
      return () => this.listsaveList({deferDate: null})
    },
    removeRepeat() {
      return () => this.listsaveList({calendar: null})
    },
    removeHeaderTag() {
      return tagName => {
        this.$store.dispatch('list/removeListTag', {
          listId: this.viewList.id,
          tagId: this.listgetListTags.find(el => el.name === tagName).id,
        })
      }
    },
    removeDeadline() {
      this.listsaveList({deadline: null})
    },

    removeDeadline() {},
    saveSchedule() {
      return info =>  localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    removeHeaderTag() {},
    removeDeferDate() {},
    
    
    mainFilter() {
      const list = this.viewList
      if (list) {
        return task => this.isTaskInList(task, list.id)
      }
      return () => false
    },
    rootFilter() {
      return this.isTaskInListRoot
    },
    headings() {
      const arr = []
      const viewList = this.viewList
      if (viewList) {

        for (const h of viewList.headings) {
          const pipedFilter = task => this.isTaskInHeading(task, h)
          const sort = tasks => this.$store.getters.checkMissingIdsAndSortArr(h.tasks, tasks)

          arr.push({
            name: h.name,
            id: h.id,
            allowEdit: true,
            showHeadingName: false,
            notes: h.notes,
            calendarStr: true,

            onEdit: tasks => name => {
              this.$store.dispatch('list/saveHeadingName', {
                name,
                listId: viewList.id,
                headingId: h.id,
              })
            },
            sort,
            filter: pipedFilter,
            options: tasks => {
              return utilsList.listHeadingOptions(viewList, h, this.$store, tasks, this.l)
            },
            fallbackItem: (task, force) => {
              if (force || (!task.heading && !task.folder && task.list === viewList.id))
                task.heading = h.id
              task.tags = [...task.tags || [], ...this.listgetListTags.map(el => el.id)]
              return task
            },

            saveNotes: notes => {
              this.$store.dispatch('list/saveHeadingNotes', {
                listId: viewList.id, notes, heading: h.id,
              })
            },
            updateIds: ids => {
              this.$store.dispatch('list/updateHeadingsTaskIds', {
                headingId: h.id, listId: viewList.id, ids,
              })
            },
            onAddTask: obj => {
              this.$store.dispatch('list/addTaskHeading', {
                ...obj, headingId: h.id, listId: viewList.id,
              })
            },
            onSortableAdd: (evt, taskIds, type, ids) => {
              this.$store.dispatch('list/moveTasksBetweenHeadings', {
                taskIds, ids, headingId: h.id, listId: viewList.id,
              })
            }
          })
        }
      }
      return arr
    },
    headingsOrder() {
      const list = this.viewList
      if (list && list.headingsOrder)
        return list.headingsOrder
      return []
    },
    
    icon() {
      return this.isViewListSomeday ? 'archive' : 'tasks'
    },
    viewNameValue() {return this.viewName},
    updateHeadingIds() {
      const list = this.viewList
      if (list) {
        return ids => {
          this.$store.dispatch('list/updateListHeadings', {
            listId: list.id,
            ids,
          })
        }
      }
      return null
    },
    files() {
      const list = this.viewList
      if (list) {
        return {
          id: list.id,
          storageFolder: 'lists',
          files: list.files,
        }
      }
      return null
    },
    tasksOrder() {
      const list = this.viewList
      if (list && list.tasks)
        return list.tasks
      return []
    },
    showEmptyHeadings() {
      return true
    },
    showAllHeadingsItems() {
      return true
    },
    getListTags() {
      const list = this.viewList
      if (list && list.tags)
        return this.getTagsById(list.tags)
      return []
    },
    headerTags() {
      return this.listgetListTags.map(el => el.name)
    },
    saveHeaderContent() {
      const save = obj => {
        this.$store.dispatch('list/saveList', {
          id: this.viewList.id,
          ...obj
        })
      }
      
      return obj => {
        if (obj.deadline !== undefined)
          save(obj)
      }
    },
    deadline() {
      const list = this.viewList
      return list ? list.deadline : null
    },
    headerCalendar() {
      const list = this.viewList
      if (list)
        return list.calendar
      return null
    },
    headerOptions() {
      const list = this.viewList
      if (list)
        return utilsList.listOptions(list, true)
      return null
    },
    headingEditOptions() {
      const list = this.viewList
      if (list) {
        const headings = list.headings || []
        return {
          excludeNames: headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
          placeholder: 'Heading name...',
        }
      }
      return null
    },
    getViewNotes() {
      const list = this.viewList
      if (list)
        return list.notes
      return null
    },
    itemCompletionCompareDate() {
      const list = this.viewList
      const c = list && list.calendar
      return c && c.lastCompleteDate
    },
    getPieProgress() {
      const list = this.viewList
      if (list && !this.isViewListSomeday)
        return this.$store.getters['list/pieProgress'](this.tasks, list.id, this.isTaskCompleted)
      return null
    },
    savedSchedule() {
      const schedule = localStorage.getItem('schedule_' + this.viewName)
      return schedule !== 'null' ? JSON.parse(schedule) : null
    },
  },
}
