<template>
  <ViewRenderer
    :isSmart='isSmart'
    :viewName='viewName'
    :viewNameValue='viewNameValue'
    :viewType='viewType'
    :icon="icon"
    :illustration='illustration'
    :showHeader='isListType'
    :showEmptyHeadings='isListType'
    :headingEdit='headingEdit'
    :headerOptions='headerOptions'
    :notes='getViewNotes'
    :progress='getPieProgress'

    :headingsOptions='headingsOptions'
    :tasks='getTasks'
    :tasksOrder='tasksOrder'
    :onSortableAdd='onSortableAdd'

    @show-completed='v => showCompleted = v'

    @save-header-name='saveHeaderName'
    @save-notes='saveNotes'

    @update-ids='updateIds'
    @update-heading-ids='updateHeadingIds'
    @add-task='addTask'
    @add-heading='addHeading'
  />
</template>

<script>

import ViewRendererVue from './ViewRenderer.vue'
import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/'

import mom from 'moment'

export default {
  props: ['isSmart', 'viewType', 'viewName'],
  components: {
    ViewRenderer: ViewRendererVue,
  },
  data() {
    return {
      showCompleted: false,
    }
  },
  methods: {
    addTask(obj) {
      if (this.isSmart) {
        let calendar = null

        if (!obj.task.calendar) {
          calendar = this.getCalObjectByView(this.viewName, obj.task.calendar)
          obj.task.calendar = calendar
        }
        if (obj.task.calendar === undefined)
          obj.task.calendar = null
        this.$store.dispatch('list/addTaskByIndexSmart', {
          ...obj, list: this.viewName,
        })
      } else if (this.viewTag) {
        obj.task.tags = [this.viewTag.id]
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })  
      } else if (this.isListType)
        this.$store.dispatch('task/addTask', {
          ...obj.task, list: this.viewList.id
        })
    },
    updateIds(ids) {
      if (this.isSmart) {
        this.$store.dispatch('list/updateViewOrder', {
          view: this.viewName,
          ids,
        })
      } else if (this.isListType) {
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
      }
    },
    updateHeadingIds(ids) {
      if (this.isSmart) {
        this.$store.dispatch('list/updateHeadingsViewOrder', {
          view: this.viewName,
          ids,
        })
      } else if (this.isListType)
        this.$store.dispatch('list/updateListHeadings', {
          listId: this.viewList.id,
          ids,
        })
    },
    saveHeaderName(name) {
      if (!this.isSmart) {
        if (this.isListType) {
          this.$router.push('/user?list='+name)
          this.$store.dispatch('list/saveList', {
            name,
            id: this.viewList.id,
          })
        } else if (this.viewType === 'tag' && this.viewTag)
          this.$router.push('/user?tag='+name)
          this.$store.dispatch('tag/saveTag', {
            name, id: this.viewTag.id
          })
      }
    },
    saveNotes(notes) {
      if (this.isListType)
        this.$store.dispatch('list/saveList', {
          notes, id: this.viewList.id,
        })
      else (this.viewType === 'tag' && this.viewTag)
        this.$store.dispatch('tag/saveTag', {
          notes, id: this.viewTag.id
        })
    },
    addHeading(obj) {
      if (this.viewList)
        this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
    },
    onSortableAdd(evt, {dataset}, type, ids) {
      if (this.isListType) {
        const taskId = dataset.id
        this.$store.dispatch('list/removeTaskFromHeading', {
          taskId, ids, listId: this.viewList.id,
        })
      } else if (this.viewName === 'Today' || this.viewName === 'Tomorrow') {
        this.$store.dispatch('list/removeTaskFromList', {
          taskId: dataset.id, view: this.viewName, ids,
        })
      }
    },
    getCalObjectByView(viewName, cal) {
      if (this.viewName === 'Today')
        return this.getSpecificDayCalendarObj(mom(), cal)
      if (this.viewName === 'Tomorrow')
        return this.getSpecificDayCalendarObj(mom().add(1, 'day'), cal)
    },

    getListHeadingsByView(view) {
      const ts = utilsTask.filterTasksByView(this.tasksWithLists, view)
      
      if (ts && ts.length > 0) {
        const savedLists = this.lists
        const setOfLists = new Set()
        for (const t of savedLists) {
          if (!setOfLists.has(t)) {
            setOfLists.add(t)
          }
        }
        let lists = Array.from(setOfLists)
        let order = this.viewOrders[view].headings
        if (!order) order = []
        lists = utils.checkMissingIdsAndSortArr(order, lists)
        const arr = []
        for (const list of lists) {
          const saveOrder = ids =>
            this.$store.dispatch('list/saveSmartViewHeadingTasksOrder', {
              ids, listId: list.id, smartView: this.viewName,
            })
          const getTasks = () => ts.filter(el => el.list === list.id)
          
          arr.push({
            name: list.name,
            allowEdit: true,
            hideListName: true,
            showHeadingName: true,
            onEdit: (name) => {
              this.$store.dispatch('list/saveList', {
                name, id: list.id,
              })
            },
            order: () => {
              let taskOrder = []
              if (list.smartViewsOrders && list.smartViewsOrders[this.viewName])
                taskOrder = list.smartViewsOrders[this.viewName]
              else
                taskOrder = this.getAllTasksOrderByList(list.id)
              return taskOrder
            },
            filter: (a, h, showCompleted) => {
              let tasks = getTasks()

              if (!showCompleted)
                tasks = utilsTask.filterTasksByCompletion(tasks, true)

              return tasks
            },
            options: [
              {
                name: 'Edit list',
                icon: 'pen',
                callback: (j, vm, l) => {
                  vm.$emit('edit')
                }
              },
              {
                name: this.l['Sort tasks'],
                icon: 'sort',
                callback: () => [
                  {
                    name: this.l['Sort by name'],
                    icon: 'sort-name',
                    callback: () => {
                      const tasks = getTasks()
                      tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                      saveOrder(tasks.map(el => el.id))
                    },
                  },
                  {
                    name: this.l['Sort by priority'],
                    icon: 'priority',
                    callback: () => {
                      const tasks = utilsTask.sortTasksByPriority(getTasks())
                      saveOrder(tasks.map(el => el.id))
                    },
                  },
                  {
                    name: 'Sort by date',
                    icon: 'calendar',
                    callback: () => console.log('sort tasks by date'),
                  }
                ]
              },
              {
                name: this.l['Change date'],
                icon: 'calendar',
                callback: () => ({
                  calendar: true,
                  callback: (calendar) => this.$store.dispatch('task/saveTasksById', {
                    ids: getTasks().map(el => el.id),
                    task: {calendar},
                  })
                })
              }
            ],
            id: list.id,
            updateIds: saveOrder,
            onAddTask: (obj) => {
              const t = obj.task
              if (!t.calendar)
                obj.task.calendar = this.getCalObjectByView(this.viewName, t.calendar)
              t.list = list.id
              t.calendar = this.getSpecificDayCalendarObj(mom())
              this.$store.dispatch('task/addTask', {
                ...t, 
              })
            },
            onSortableAdd(evt, {dataset}, type, ids) {
              const taskId = dataset.id
              this.$store.dispatch('list/moveTaskToList', {
                taskId, ids, listId: t.id,
              })
            }
          })
        }

        return arr
      }
      return []
    }
  },
  computed: {
    ...mapState({
      tags: state => state.tag.tags,
      tasks: state => state.task.tasks,
      lists: state => state.list.lists,
      viewOrders: state => state.list.viewOrders,      
    }),
    ...mapGetters({
      l: 'l',
      isDesktop: 'isDesktop',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      getAllTasksOrderByList: 'list/getAllTasksOrderByList',
      getTasksOfList: 'list/getTasks',
    }),
    viewNameValue() {
      if (this.isSmart) return this.l[this.viewName]
      return this.viewName
    },
    icon() {
      if (this.isSmart) return null
      switch (this.viewType) {
        case 'list': return 'tasks'
        case 'tag': return 'tag'
      }
    },
    notHeadingHeaderView() {
      return this.viewName !== 'Upcoming' && this.viewName !== 'Completed'
    },
    getTasks() {
      if (this.viewType === 'search')
        return this.tasks.filter(el => el.name.includes(this.viewName))
      if (this.isSmart && this.notHeadingHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return utilsTask.filterTasksByView(this.tasksWithoutLists, this.viewName)
      }
      else if (this.viewType === 'tag' && this.viewTag)
        return this.tasks.filter(el => el.tags.includes(this.viewTag.id))
      else if (this.isListType) {
        return this.getRootTasksOfList
      }
      return []
    },
    tasksOrder() {
      if (this.isSmart) {
        let o = this.viewOrders[this.viewName]
        if (o && o.tasks) o = this.viewOrders[this.viewName].tasks
        if (o) return o
      } else if (this.isListType)
        return this.viewList.tasks
      return []
    },
    headingsOptions() {
      if (this.isSmart) {
        switch (this.viewName) {
          case 'Upcoming': return this.upcomingHeadingsOptions
          case 'Tomorrow': return this.getListHeadingsByView('Tomorrow')
          case 'Today': {
            if (this.hasOverdueTasks) return this.todayHeadingsOptions
            return this.getListHeadingsByView('Today')
          }
          case 'Completed': {
            return this.completedHeadingsOptions
          }
        }
      } else if (this.isListType)
        return this.listHeadingsOptions
      return []
    },
    illustration() {
      const l = this.l
      const n = this.viewName
      if (this.isSmart) {
        switch (n) {
          case 'Today':
            return {
              name: 'HappyFace',
              title: l['Enjoy the rest of the day'],
              descr: l['You already completed everything here!'],
            }
          case 'Tomorrow':
            return {
              name: 'Sleep',
              title: l['Nothing here...'],
              descr: l['You have not tasks for tomorrow.'],
              width: '150px'
            }
          case 'Inbox':
            return {
              name: 'EmptyInbox',
              title: l["Congrats! Your Inbox is empty."],
              width: '150px',
            }
          case 'Upcoming':
            return {
              name: 'EmptyCalendar',
              title: l["You don't have any upcoming tasks!"],
              width: '150px',
            }
          case 'Completed':
            return {
              name: 'CleanCheck',
              title: l["Hurray! Everything is clean here!"],
              descr: l["You don't have any completed tasks, how about completing some?"],
              width: '150px',
            }
        }
      }
      else if (this.viewType === 'tag')
        return {
          name: 'SadTag',
          title: l["This tag doesn't have any tasks."],
          descr: l["How about adding one using the floating button?"],
          width: '150px',
        }
      else if (this.viewName)
        return {
          name: 'EmptyList',
          title: l["This list doesn't have any tasks."],
          descr: l["You can add tasks and headings by dropping the floating buttons here."],
          width: '150px',
        }
    },

    headerOptions() {
      let opt = []
      if (this.isListType) {
        opt = [
          {
            name: this.l['Edit list'],
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...this.viewList, editing: true}})
            }
          },
          {
            name: this.l["Duplicate list"],
            icon: 'copy',
            callback: () => {
              this.$store.dispatch('list/duplicateList', {
                list: this.viewList, rootTasks: this.getRootTasksOfList,
                headingTasks: this.getTasksWithHeading,
              })
            }
          },
        ]
        if (!this.viewList.notes)
          opt.push({
            name: this.l['Add notes'],
            icon: 'note',
            callback: () => this.$store.dispatch('pushPopup', {
              comp: 'AddListNote',
              payload: this.viewList.id,
            })
          })
        if (this.isDesktop)
          opt.push({
            name: this.l["Export as template"],
            icon: 'export',
            callback: () => utils.exportListTemplate({
              list: this.viewList,
              tasks: this.getListTasks
            })
          })
      } else if (this.viewType === 'tag' && this.viewTag) {
        opt = [
          {
            name: this.l['Edit tag'],
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {
                comp: 'AddTag', payload: {...this.viewTag, editing: true}
              })
            }
          }
        ]
        if (!this.viewTag.notes) {
          opt.push({
            name: this.l['Add notes'],
            icon: 'note',
            callback: () => this.$store.dispatch('pushPopup', {
              comp: 'AddTagNote',
              payload: this.viewTag.id,
            })
          })
        }
      }
      return opt
    },
    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
    viewList() {
      return this.lists.find(el => el.name === this.viewName)
    },
    getListTasks() {
      return this.getTasksOfList(this.tasks, this.viewList.id)
    },
    tasksWithoutLists() {
      return this.tasks.filter(el => !el.list)
    },
    tasksWithLists() {
      return this.tasks.filter(el => el.list)
    },
    getRootTasksOfList() {
      return [...this.getListTasks.filter(el => !el.heading), ...this.getLostTasks]
    },
    getLostTasks() {
      const headingNames = this.viewList.headings.map(el => el.name)
      return this.getListTasks.filter(el => !headingNames.includes(el.heading))
    },
    getTasksWithHeading() {
      return this.getListTasks.filter(el => el.heading)
    },
    headingEdit() {
      if (!this.isSmart && this.viewType === 'list' && this.viewList)
        return {
          excludeNames: this.viewList.headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
        }
      else if (this.viewName === "Today" || this.viewName === "Tomorrow")
        return {
          excludeNames: this.lists.map(el => el.name),
          errorToast: "There's already another list with this name."
        }
      return []
    },
    listHeadingsOptions() {
      const arr = []
      const viewList = this.viewList
      let order = viewList.headingsOrder
      if (!order) order = []
      
      const heads = utils.checkMissingIdsAndSortArr(order, viewList.headings, 'name')
      
      for (const h of heads) {
        let headingTasks = this.getListTasks.filter(el => el.heading === h.name)
        headingTasks= utils.checkMissingIdsAndSortArr(h.tasks, headingTasks)
        arr.push({
          name: h.name,
          allowEdit: true,
          showHeadingName: false,
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
          options: [
            {
              name: this.l['Edit heading'],
              icon: 'pen',
              callback: (j, vm, l) => {
                vm.$emit('edit')
              }
            },
            {
              name: this.l['Uncomplete tasks'],
              icon: 'circle',
              callback: () => this.$store.dispatch('list/uncompleteHeadingTasks', {
                listId: this.viewList.id,
                name: h.name, savedTasks: this.tasks,
              })
            },
            {
              name: this.l['Duplicate heading'],
              icon: 'copy',
              callback: () => {
                this.$store.dispatch('list/duplicateHeading', {
                  name: h.name, listId: viewList.id, tasks: headingTasks.slice(),
                })
              }
            },
            {
              name: this.l["Convert to list"],
              icon: 'tasks',
              important: true,
              callback: () => {
                if (this.lists.some(l => l.name === h.name))
                  this.$store.commit('pushToast', {
                    name: this.l['There is already a list with this heading name.'],
                    seconds: 3,
                    type: 'error',
                  })
                else 
                  this.$store.dispatch('list/convertHeadingToList', {
                    name: h.name, listId: viewList.id, taskIds: headingTasks.map(el => el.id)
                  })
              }
            },
            {
              name: this.l['Delete heading'],
              icon: 'trash',
              important: true,
              callback: () => {
                this.$store.dispatch('list/deleteHeadingFromList', {
                  listId: this.viewList.id,
                  name: h.name, savedTasks: this.tasks,
                })
              },
            },
          ],
          updateIds: ids => {
            this.$store.dispatch('list/updateHeadingsTaskIds', {
              name: h.name, listId: viewList.id, ids,
            })
          },
          onAddTask(obj) {
            this.$store.dispatch('list/addTaskHeading', {
              name: obj.header.name, ids: obj.ids, listId: viewList.id, task: obj.task, index: obj.index,
            })
          },
          onSortableAdd(evt, {dataset}, type, ids) {
            const taskId = dataset.id
            this.$store.dispatch('list/moveTaskBetweenHeadings', {
              taskId, ids, name: h.name, listId: viewList.id,
            })
          }
        })
      }

      return arr
    },
    upcomingHeadingsOptions() {
      const arr = []
      const tod = mom()
      const calObj = (date) => ({
        defer: null,
        due: null,

        type: 'specific',
        time: null,
        editDate: mom().format('Y-M-D'),

        specific: date,
        weekly: null,
        lastCompleteDate: null,
        periodic: null
      })
      for (let i = 0;i < 31;i++) {
        tod.add(1, 'day')
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          filter: (tasks) => {
            return utilsTask.filterTasksByDay(tasks.filter(el => {
              return el.calendar && el.calendar.type === 'specific'
            }), mom(date, 'Y-M-D'))
          },
          id: date,
          onAddTask(obj) {
            const date = obj.header.id
            this.$store.dispatch('task/addTask', {
              ...obj.task, calendar: calObj(date)
            })
          },
          onSortableAdd: (evt) => {
            this.$store.dispatch('task/saveTask', {
              id: evt.item.dataset.id,
              calendar: calObj(date)
            })
          },
        })
      }
      return arr
    },
    getViewNotes() {
      if (this.isListType) return this.viewList.notes
      else if (this.viewType === 'tag' && this.viewTag) return this.viewTag.notes
      return null
    },
    completedHeadingsOptions() {
      const arr = []
      const tod = mom()
      for (let i = 0;i < 31;i++) {
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          filter: (tasks) => {
            tasks = utilsTask.filterTasksByCompletion(tasks, false, mom(date, 'Y-M-D'))
            return tasks.filter(t => {
              const complete = mom(t.completeDate, 'Y-M-D')
              return complete.isSame(mom(date, 'Y-M-D'), 'day')
            })
          },
          id: date,
          disableTaskRenderer: true,
        })
        tod.subtract(1, 'day')
      }
      return arr
    },
    todayHeadingsOptions() {
      const dispatch = this.$store.dispatch
      const l = this.l
      const saveTasksDay = (ids, mom) => {
        dispatch('task/saveTasksById', {
          ids, task: {calendar: this.$store.getters['task/getSpecificDayCalendarObj'](mom)}
        })
      }
      const overIds = this.getOverdueTasks.map(el => el.id)
      return [
        {
          name: l['Overdue'],
          id: 'overdue',
          filter: (tasks) => this.getOverdueTasks,
          color: 'var(--red)',
          options: [
            {
              name: 'Move to today',
              icon: 'star',
              callback: () => saveTasksDay(overIds, mom())
            },
            {
              name: 'Move to tomorrow',
              icon: 'sun',
              callback: () => saveTasksDay(overIds, mom().add(1, 'd'))
            },
            {
              name: 'Select date',
              icon: 'calendar',
              callback: () => {return {
                calendar: true,
                callback: (calendar) => {
                  dispatch('task/saveTasksById', {
                    ids: overIds,
                    task: {calendar},
                  })
                }
              }}
            }
          ]
        },
        {
          name: l['Today'],
          id: 'todya',
          filter: (tasks) => this.getTasks,
        },
      ]
    },
    isListType() {
      return !this.isSmart && this.viewList && this.viewType === 'list'
    },
    hasOverdueTasks() {
      return this.getOverdueTasks.length > 0
    },
    getOverdueTasks() {
      return utilsTask.filterTasksByView(this.tasks, 'Overdue')
    },
    getPieProgress() {
      if (!this.isListType || !this.viewList) return undefined
      return this.$store.getters['list/pieProgress'](this.tasks, this.viewList.id)
    },
  },
}

</script>
