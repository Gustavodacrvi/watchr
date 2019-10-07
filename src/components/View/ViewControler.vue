<template>
  <ViewRenderer
    :viewName='viewName'
    :viewNameValue='viewNameValue'
    :viewType='viewType'
    :icon="icon"
    :illustration='illustration'
    :showHeader='isListType'

    :headingsOptions='headingsOptions'
    :tasks='getTasks'
    :tasksOrder='tasksOrder'

    @update-ids='updateIds'
    @add-task='addTask'
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
  methods: {
    addTask(obj) {
      if (this.isSmart) {
        let calendar = null
  
        if (this.viewName === 'Today')
          calendar = this.getSpecificDayCalendarObj(mom())
        else if (this.viewName === 'Tomorrow')
          calendar = this.getSpecificDayCalendarObj(mom().add(1, 'day'))
  
        obj.task.calendar = calendar
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
      } else if (this.isListType)
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
    },
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
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
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
    notSmartHeaderView() {
      return this.viewName !== 'Upcoming' && this.viewName !== 'Completed'
    },
    getTasks() {
      if (this.isSmart && this.notSmartHeaderView) {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return utilsTask.filterTasksByView(this.tasks, this.viewName)
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
          case 'Today': {
            if (this.hasOverdueTasks) return this.todayHeadingsOptions
            return []
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
          name: 'SadTag',
          title: "This illustration will change MOTHERFUCKER!.",
          width: '150px',
        }
    },

    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
    },
    viewList() {
      return this.lists.find(el => el.name === this.viewName)
    },
    getListTasks() {
      return this.tasks.filter(el => el.list === this.viewList.id)
    },
    getRootTasksOfList() {
      return this.getListTasks.filter(el => !el.heading)
    },
    listHeadingsOptions() {
      const arr = []
      const heads = this.viewList.headings
      for (const h of heads) {
        arr.push({
          name: h.name,
          filter: () => [],
          id: h.name,
          editHeadingExcludeNames: h.headings,
          excludeNamesErrorToast: "There's already another heading with this name.",
          onAddTask(obj) {
            console.log('liskRenderEditAdder', obj)
          },
          onAdd(evt) {
            console.log('listHeadingsListAdder', evt)
          }
        })
      }

      return []
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
          onAdd: (evt) => {
            this.$store.dispatch('task/saveTask', {
              id: evt.item.dataset.id,
              calendar: calObj(date)
            })
          },
        })
      }
      return arr
    },
    completedHeadingsOptions() {
      const arr = []
      const tod = mom()
      for (let i = 0;i < 31;i++) {
        const date = tod.format('Y-M-D')
        arr.push({
          name: utils.getHumanReadableDate(date, this.l),
          filter: (tasks) => {
            return tasks.filter(t => {
              if (t.calendar) {
                const type = t.calendar.type
                if (type === 'weekly' || type === 'periodic') return false
              }
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
      const saveTasksDay = (ids, mom) => {
        dispatch('task/saveTasksById', {
          ids, task: {calendar: this.$store.getters['task/getSpecificDayCalendarObj'](mom)}
        })
      }
      const overIds = this.getOverdueTasks.map(el => el.id)
      return [
        {
          name: 'Overdue',
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
          name: 'Today',
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
  },
}

</script>
