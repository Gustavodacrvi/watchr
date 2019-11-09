
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import utils from '@/utils/'
import mom from 'moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewList) {
        if (!obj.task.list)
          obj.task.list = this.viewList.id
        obj.task.tags = [...obj.task.tags, ...this.listgetListTags.map(el => el.id)]
        this.$store.dispatch('list/addTaskByIndex', {
          ...obj, listId: this.viewList.id,
        })
      }
    },
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
    updateIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
      }
    },
    updateHeadingIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/updateListHeadings', {
          listId: this.viewList.id,
          ids,
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
    removeDeferDate() {
      this.$store.dispatch('list/saveList', {
        id: this.viewList.id,
        deferDate: null,
      })
    },
    removeRepeat(val) {
      console.log('controller/list.js', val)
    },
    removeHeaderTag(tagName) {
      this.$store.dispatch('list/removeListTag', {
        listId: this.viewList.id,
        tagId: this.listgetListTags.find(el => el.name === tagName).id,
      })
    },
    removeDeadline() {
      this.$store.dispatch('list/saveList', {
        id: this.viewList.id,
        deadline: null,
      })
    }
  },
  computed: {
    icon() {return 'tasks'},
    viewNameValue() {return this.viewName},
    getTasks() {
      return this.getRootTasksOfList
    },
    tasksOrder() {
      if (this.viewList)
        return this.viewList.tasks
      return []
    },
    showEmptyHeadings() {
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
    headingsOptions() {
      const arr = []
      if (this.viewList) {
        const viewList = this.viewList
        let order = viewList.headingsOrder
        if (!order) order = []
        
        const heads = utils.checkMissingIdsAndSortArr(order, viewList.headings, 'name')

        for (const h of heads) {
          let headingTasks = this.getListTasks.filter(el => el.heading === h.name)
          headingTasks = utils.checkMissingIdsAndSortArr(h.tasks, headingTasks)
          arr.push({
            name: h.name,
            allowEdit: true,
            showHeadingName: false,
            notes: h.notes,
            saveNotes: notes => {
              this.$store.dispatch('list/saveHeadingNotes', {
                listId: this.viewList.id, notes, heading: h.name,
              })
            },
            onEdit: (name) => {
              this.$store.dispatch('list/saveHeadingName', {
                listId: this.viewList.id,
                oldName: h.name,
                newName: name,
                tasksIds: headingTasks.map(el => el.id)
              })
            },
            filter: (a, h, showCompleted) => {
              let tasks = headingTasks.slice()
              if (!showCompleted)
                tasks = utilsTask.filterTasksByCompletion(tasks, true)
              
              return tasks
            },
            id: h.name,
            autoHide: h.autoHide,
            optionClick: (iconName) => {
              switch (iconName) {
                case 'archive': {
                  this.$store.dispatch('list/toggleHeadingAuthide', {
                    listId: this.viewList.id,
                    name: h.name,
                  })
                  break
                }
              }
            },
            options: utilsList.listHeadingOptions(this.viewList, h, this.$store, headingTasks, this.l),
            updateIds: ids => {
              this.$store.dispatch('list/updateHeadingsTaskIds', {
                name: h.name, listId: viewList.id, ids,
              })
            },
            onAddTask: obj => {
              obj.task.tags = [...obj.task.tags, ...this.listgetListTags.map(el => el.id)]
              this.$store.dispatch('list/addTaskHeading', {
                name: obj.header.name, ids: obj.ids, listId: viewList.id, task: obj.task, index: obj.index,
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
    illustration() {
      const l = this.l
      return {
        name: 'EmptyList',
        title: l["This list doesn't have any tasks."],
        descr: l["You can add tasks and headings by dropping the floating buttons here."],
        width: '150px',
      }
    },
    headerOptions() {
      if (this.viewList)
        return utilsList.listOptions(this.viewList, this.$store, this.getListTasks, this.l)
      return []
    },
    headingEdit() {
      if (this.viewList)
        return {
          excludeNames: this.viewList.headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
        }
      return []
    },
    getViewNotes() {
      if (this.viewList)
        return this.viewList.notes
      return null
    },
    getPieProgress() {
      if (this.viewList)
        return this.$store.getters['list/pieProgress'](this.tasks, this.viewList.id)
      return []
    },
  },
}
