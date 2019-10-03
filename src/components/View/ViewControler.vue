<template>
  <ViewRenderer v-if="hasTasks"
    emptyIcon='happy-star'
    :viewName='viewName'
    :viewNameValue='viewNameValue'
    :viewType='viewType'
    :icon="icon"
    :illustration='illustration'
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
        console.log(obj, this.viewName)
        this.$store.dispatch('list/addTaskByIndexSmart', {
          ...obj, list: this.viewName,
        })
      } else if (this.viewTag) {
        obj.task.tags = [this.viewTag.id]
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })  
      }
    },
    updateIds(ids) {
      if (this.isSmart) {
          this.$store.dispatch('list/updateViewOrder', {
          view: this.viewName,
          ids,
        })
      }
    },
  },
  computed: {
    ...mapState({
      tags: state => state.tag.tags,
      tasks: state => state.task.tasks,
      viewOrders: state => state.list.viewOrders,      
    }),
    ...mapGetters({
      l: 'l',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
    }),
    hasTasks() {
      return this.getTasks.length > 0 || this.headingsOptions.length > 0
    },
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
    getTasks() {
      if (this.isSmart && this.viewName !== 'Upcoming') {
        if (this.viewName === 'Today' && this.hasOverdueTasks) return []
        return utilsTask.filterTasksByView(this.tasks, this.viewName)
      }
      else if (this.viewType === 'tag' && this.viewTag)
        return this.tasks.filter(el => el.tags.includes(this.viewTag.id))
      return []
    },
    tasksOrder() {
      if (this.isSmart) {
        const o = this.viewOrders[this.viewName]
        if (o) return o
      }
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
        }
      }
      return []
    },
    illustration() {
      const l = this.l
      if (this.viewName === 'Today')
        return {
          name: 'HappyFace',
          title: this.l['Enjoy the rest of the day'],
          descr: this.l['You already completed everything here!'],
        }
      else if (this.viewName === 'Tomorrow')
        return {
          name: 'Sleep',
          title: this.l['Nothing here...'],
          descr: this.l['You have not tasks for tomorrow.'],
          width: '150px'
        }
    },

    viewTag() {
      return this.tags.find(el => el.name === this.viewName)
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
    hasOverdueTasks() {
      return this.getOverdueTasks.length > 0
    },
    getOverdueTasks() {
      return utilsTask.filterTasksByView(this.tasks, 'Overdue')
    },
  },
}

</script>
