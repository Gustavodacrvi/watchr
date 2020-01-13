
<template>
  <div class="TaskHandler">
    <TaskRendererVue
      v-bind="$props"

      :mainTasks='mainTasks'
      :tasks='sortLaseredTasks'

      :headings='sortHeadings'
      :scheduleObject='scheduleObject'
      :mainSelection='mainSelection'
      :mainSelectionIndex='mainSelectionIndex'
      :selectEverythingToggle='selectEverythingToggle'

      :addTask='addTask'
      :showSomedayButton='showSomedayButton'
      :rootFilterFunction='rootFilterFunction'
      :headingEditOptions='headingEditOptions'
      :taskIconDropOptions='taskIconDropOptions'
      :headingPosition='0'
      :updateHeadingIds='updateHeadingIds'

      @update="updateIds"
      @add-heading="addHeading"
      @allow-someday='allowSomeday'
      @go='go'
      @change-time='changeTime'
    />
  </div>
</template>

<script>

import TaskRendererVue from './../Tasks/TaskRenderer.vue'
import AppButton from '../../Auth/Button.vue'

import { pipeBooleanFilters } from '@/utils/memo'
import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'

import mom from 'moment'

export default {
  props: ['mainFilter', 'rootFilter', 'tasksOrder', 'headings', 'headingsOrder',

    'pipeFilterOptions', 'showCompleted', 'showSomeday', 'movingButton',
    'showHeadadingFloatingButton', 'openCalendar',

    'headingEditOptions', 'taskIconDropOptions', 'onSortableAdd',
    'viewName', 'viewType', 'viewNameValue', 'mainFilterOrder', 'mainFallbackTask', 'icon', 'configFilterOptions', 'showHeading',
    'taskCompletionCompareDate', 'rootFallbackTask', 'autoSchedule',
    'updateHeadingIds', 'showEmptyHeadings', 'showAllHeadingsItems',
  ],
  components: {
    TaskRendererVue,
    AppButton,
  },
  data() {
    return {
      scheduleObject: null,
      
      mainSelection: null,
      selectEverythingToggle: false,
      mainSelectionIndex: null,
    }
  },
  created() {
    this.updateSchedule()

    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    keydown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt
      if (!this.mainSelection || this.mainSelectionIsNotInView) {
        switch (key) {
          case 'ArrowDown': {
            this.go(true)
            p()
            break
          }
          case 'ArrowUp': {
            this.go(false)
            p()
            break
          }
        }
      }
      switch (key) {
        case 'ArrowLeft': {
          this.go(null)
          break
        }
        case 'ArrowRight': {
          this.go(null)
          break
        }
      }
      if (this.isOnControl) {
        switch (key) {
          case "a": {
            p()
            this.selectEverythingToggle = true
            setTimeout(() => {
              this.selectEverythingToggle = false
            })
          }
          case '.': {
            const tasks = this.getTasksById(this.selectedTasks)
            const completed = tasks.filter(t => t.completed)
            const uncompleted = tasks.filter(t => !t.completed)
            this.$store.dispatch('task/completeTasks', uncompleted)
            this.$store.dispatch('task/uncompleteTasks', completed)
          }
        }
      }
      if (this.isOnShift) {
        const save = task => {
          this.$store.dispatch('task/saveTasksById', {
              ids: this.selectedTasks,
              task,
            })
        }
        
        switch (key) {
          case 'S': {
            save({
              calendar: {
                type: 'someday'
              }
            })
            break
          }
          case 'T': {
            const TOD_STR = mom().format('Y-M-D')
            save({
              calendar: {
                type: 'specific',
                editDate: TOD_STR,
                begins: TOD_STR,
          
                specific: TOD_STR,
              }
            })
            break
          }
        }
      }

      if (this.isOnControl && !this.isOnShift) {
        switch (key) {
          case "ArrowUp": {
            this.go(0)
            break
          }
          case "ArrowDown": {
            this.go(this.allViewTasksIds.length - 1)
            break
          }
        }
      }

      const hasSelected = this.selectedTasks.length > 0
      if (this.isOnAlt)
        switch (key) {
          case "t": {
            if (hasSelected) {
              p()
              this.$store.commit('pushIconDrop', {
                links: this.tags.map(t => ({...t, icon: 'tag'})),
                select: true,
                onSave: names => {
                  this.$store.dispatch('task/addTagsToTasksById', {
                    ids: this.selectedTasks,
                    tagIds: this.tags.filter(t => names.includes(t.name)).map(el => el.id),
                  })
                },
                selected: [],
                allowSearch: true,
              })
            }
            break
          }
          case "l": {
            if (hasSelected) {
              p()
              this.$store.commit('pushIconDrop', {
                links: this.lists.map(t => ({
                  ...t,
                  icon: 'tasks',
                  callback: () => this.$store.dispatch('task/addListToTasksById', {
                    ids: this.selectedTasks,
                    listId: t.id,
                  }),
                })),
                allowSearch: true,
              })
            }
          }
        }
    },
    select(i) {
      if (i === null) {
        this.mainSelection = null
        this.mainSelectionIndex = null
        return true
      } else {
        const ids = this.allViewTasksIds
  
        if (ids[i]) {
          this.mainSelection = ids[i]
          this.mainSelectionIndex = i
          return true
        } else if (this.mainSelectionIsNotInView) {
          this.select(null)
        }
        return false
      }
    },
    go(dire) {
      const ids = this.allViewTasksIds
      
      if (dire === null)
        this.select(null)
      else if (this.mainSelection) {
        if (dire === true || dire === false)
          this.select(this.mainSelectionIndex + (dire === true ? 1 : -1))
        else
          this.select(dire)  
      } else if (dire > 0)
        this.select(0)
      else
        this.select(ids.length - 1)
    },
    allowSomeday() {
      this.$emit('allow-someday')
    },

    addTask(obj, evt) {
      const rootNonFilteredIds = this.rootNonFilteredIds

      let fixPosition = 0
      let i = 0
      for (const id of rootNonFilteredIds) {
        if (!obj.ids.includes(id))
          fixPosition++
        if ((i - fixPosition) === obj.index) break
        i++
      }

      
      obj.index += fixPosition
      obj.ids = rootNonFilteredIds

      this.$parent.$emit('add-task', obj)
    },
    updateIds(ids) {
      this.$parent.$emit('update-ids', utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, this.rootNonFilteredIds))
    },
    addHeading(obj) {
      this.$parent.$emit('add-heading', {...obj})
    },
    updateSchedule() {
      const schedule = this.autoSchedule
      if (schedule) {
        if (!schedule.scheduleObject)
          this.createSchedule()
        else
          this.scheduleObject = schedule.scheduleObject
      }
      else this.scheduleObject = null
    },
    changeTime({from, add, time}) {
      const obj = this.scheduleObject
      const target = obj[from]
      const timeSplited = time.split(':')

      const affectedTasks = []
      const objKeys = Object.keys(obj)
      for (const key of objKeys)
        if (obj[key].index >= target.index)
          affectedTasks.push(obj[key])

      const format = this.timeFormat
      
      const init = mom(affectedTasks[0].start, 'HH:mm')

      const hoursToAdd = parseInt(timeSplited[0], 10)
      const minutesToAdd = parseInt(timeSplited[1], 10)
      if (add) {
        init.add(hoursToAdd, 'h')
        init.add(minutesToAdd, 'm')
      } else {
        init.subtract(hoursToAdd, 'h')
        init.subtract(minutesToAdd, 'm')
      }

      const { buffer, fallback } = this.autoSchedule
      const bufferSplit = buffer.split(':')
      
      for (const el of affectedTasks) {
        const t = this.allViewTasks.filter(task => task.id === el.id)
        
        const start = init.format(format)
        const split = start.split(':')

        const startHour = split[0]
        let startMin = ''
        const startSplit = split[1]
        for (const s of startSplit)
          if (this.notChar(s))
            startMin += s

        const taskDuration = t.taskDuration ? t.taskDuration : fallback

        const durationSplit = taskDuration.split(':')

        init.add(parseInt(durationSplit[0], 10), 'h')
        init.add(parseInt(durationSplit[1], 10), 'm')

        const end = init.format(format)
        const endSplit = end.split(':')

        const endHour = endSplit[0]
        let endMin = ''
        const endSplitStr = split[1]
        for (const s of endSplitStr)
          if (this.notChar(s))
            endMin += s

        init.add(parseInt(bufferSplit[0], 10), 'h')
        init.add(parseInt(bufferSplit[1], 10), 'm')

        obj[el.id] = {...el, ...{
          start, startHour, startMin,
          end, endHour, endMin,
        }}
      }
      this.createSchedule({...obj})
    },
    createSchedule(newObj) {
      const obj = newObj || this.getScheduleObject()
      this.scheduleObject = obj
      this.$emit('save-schedule-object', obj)
    },
    notChar(s) {
      return s => s !== 'A' && s !== 'M' && s !== 'P'
    },
    getScheduleObject() {
      if (!this.autoSchedule) return null
      
      const { time, buffer, fallback } = this.autoSchedule

      const tasks = this.allViewTasks
      
      let init = mom(time, 'HH:mm')

      const bufferSplit = buffer.split(':')

      const finalObj = {}

      const format = this.timeFormat

      let i = 0
      for (const t of tasks) {
        if (t.calendar && t.calendar.time)
          init = mom(t.calendar.time, 'HH:mm')
        
        const start = init.format(format)
        const split = start.split(':')

        const region = init.format('a')

        const startHour = split[0]
        let startMin = ''
        const startSplit = split[1]
        for (const s of startSplit)
          if (this.notChar(s))
            startMin += s

        const taskDuration = t.taskDuration ? t.taskDuration : fallback

        const durationSplit = taskDuration.split(':')

        init.add(parseInt(durationSplit[0], 10), 'h')
        init.add(parseInt(durationSplit[1], 10), 'm')

        const end = init.format(format)
        const endSplit = end.split(':')

        const endHour = endSplit[0]
        let endMin = ''
        const endSplitStr = split[1]
        for (const s of endSplitStr)
          if (this.notChar(s))
            endMin += s

        init.add(parseInt(bufferSplit[0], 10), 'h')
        init.add(parseInt(bufferSplit[1], 10), 'm')

        const obj = {
          id: t.id,
          region,
          index: i,
          start, startHour, startMin,
          end, endHour, endMin,
        }

        finalObj[t.id] = obj

        i++
      }

      return finalObj
    },
  },
  computed: {
    ...mapState({
      storeTasks: state => state.task.tasks,
      selectedTasks: state => state.selectedTasks,
      userInfo: state => state.userInfo,
      tags: state => state.tag.tags,
      lists: state => state.list.lists,
      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,
    }),
    ...mapGetters({
      l: 'l',
      isTaskSomeday: 'task/isTaskSomeday',
      isTaskCompleted: 'task/isTaskCompleted',
      getTasksById: 'task/getTasksById',

      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    mainSelectionIsNotInView() {
      return !this.allViewTasksIds.includes(this.mainSelection)
    },
    timeFormat() {
      return this.userInfo.disablePmFormat ? 'H:mm' : 'LT'
    },
    rootNonFilteredIds() {
      return this.rootNonFiltered.map(el => el.id)
    },
    allViewTasks() {
      return [...this.sortLaseredTasks,...this.sortHeadings.map(
        head => head.tasks
      ).flat()]
    },
    allViewTasksIds() {
      return this.allViewTasks.map(el => el.id)
    },
    allNonFilteredViewTasks() {
      return [...this.rootNonFiltered,...this.sortHeadings.map(
        head => head.nonFiltered
      ).flat()]
    },

    sortHeadings() {
      return this.sortHeadingsFunction(this.laserHeadings)
    },
    laserHeadings() {
      const headings = this.headings
      if (!headings) return []
      return headings.map(head => {
        if (head.react)
          for (const p of head.react) this.mainTasks[p]
        const nonFiltered = head.sort(this.mainTasks.filter(task => head.filter(task)))
        const tasks = nonFiltered.filter(this.filterOptionsPipe)

        let updateIds = ids =>
            head.updateIds(
              utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids,
                nonFiltered.map(el => el.id),
              )
            )
        
        const unshiftSortingOptions = options => {
          const opt = [
            {
              name: this.l['Sort tasks'],
              icon: 'sort',
              callback: () => [
                {
                  name: this.l['Sort by name'],
                  icon: 'sort-name',
                  callback: () => {
                    const ts = nonFiltered.slice()
                    tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    updateIds(tasks.map(el => el.id))
                  },
                },
                {
                  name: this.l['Sort by priority'],
                  icon: 'priority',
                  callback: () => {
                    const ts = utilsTask.sortTasksByPriority(tasks.slice())
                    updateIds(ts.map(el => el.id))
                  },
                },
                {
                  name: this.l['Sort by creation date'],
                  icon: 'calendar',
                  callback: () => {
                    const ts = utilsTask.sortTasksByTaskDate(tasks.slice())
                    updateIds(ts.map(el => el.id))
                  },
                },
                {
                  name: this.l['Sort by duration(long to short)'],
                  icon: 'magic',
                  callback: () => {
                    const ts = utilsTask.sortTasksByDuration(tasks.slice(), 'long')
                    updateIds(ts.map(el => el.id))
                  }
                },
                {
                  name: this.l['Sort by duration(short to long)'],
                  icon: 'magic',
                  callback: () => {
                    const ts = utilsTask.sortTasksByDuration(tasks.slice(), 'short')
                    updateIds(ts.map(el => el.id))
                  }
                },
              ]
            },
          ]
          if (options && options.length > 0)
            opt.push({
              type: 'hr',
              name: 'division',
            })
          return [...opt, ...options]
        }
        
        if (!head.updateIds)
          updateIds = undefined

        return {
          ...head,
          filter: undefined,
          tasks,
          nonFiltered,
          options: tasks => {
            let options = head.options ? head.options(tasks) : []

            if (updateIds)
              options = unshiftSortingOptions(options)
            return options
          },
          updateIds,
          filterFunction: pipeBooleanFilters(
            head.filter,
            this.mainFilterFunction,
          ),
          progress: head.progress ? head.progress() : undefined,
          onEdit: head.onEdit ? head.onEdit(nonFiltered) : () => {},
        }
      })
      },

    rootFilterFunction() {
      return pipeBooleanFilters(
        this.rootFilter,
        this.mainFilterFunction,
      )
    },
    mainFilterFunction() {
      return pipeBooleanFilters(
        this.mainFilter,
        this.filterOptionsPipe,
      )
    },

    sortLaseredTasks() {
      return this.rootNonFiltered.filter(this.filterOptionsPipe)
    },
    rootNonFiltered() {
      return this.sortTasksFunction(this.mainTasks.filter(task => this.rootFilter(task)))
    },
    mainTasks() {
      return this.storeTasks.filter(task => this.mainFilter(task))
    },

    sortHeadingsFunction() {
      const order = this.headingsOrder
      return headings => {
        return this.checkMissingIdsAndSortArr(order || [], headings)
      }
    },
    sortTasksFunction() {
      const order = this.tasksOrder
      return tasks => {
        return this.checkMissingIdsAndSortArr(order || [], tasks)
      }
    },

    showSomedayButton() {
      return this.hasAtLeastOneSomeday &&
          !this.showSomeday &&
          this.filteredFilterOptionsByConfig.includes('pipeSomeday')
    },
    filterOptionsPipes() {
      return [
        'pipeFilterOptions', 'pipeSomeday', 'pipeCompleted',
      ]
    },
    filteredFilterOptionsByConfig() {
      let pipes = this.filterOptionsPipes

      if (this.configFilterOptions)
        pipes = pipes.filter(this.configFilterOptions)

      return pipes
    },
    filterOptionsPipe() {
      return pipeBooleanFilters(
        ...this.filteredFilterOptionsByConfig.map(p => this[p])
      )
    },
    hasAtLeastOneSomeday() {
      const rootNonFiltered = this.rootNonFiltered
      for (const task of rootNonFiltered)
        if (this.isTaskSomeday(task))
          return true
      const laserHeadings = this.laserHeadings
      for (const head of laserHeadings)
        if (head.nonFiltered.some(task => this.isTaskSomeday(task)))
          return true
      return false
    },
    pipeSomeday() {
      if (this.showSomeday) return () => true
      return task => !this.isTaskSomeday(task)
    },
    pipeCompleted() {
      if (this.showCompleted) return () => true
      return task => !this.isTaskCompleted(task)
    },

    presentTags() {
      const unique = new Set()
      return this.allNonFilteredViewTasks.map(t => t.tags || []).flat().filter(id => {
        if (!unique.has(id)) {
          unique.add(id) 
          return id
        }
      })
    },
    presentLists() {
      const unique = new Set()
      return this.allNonFilteredViewTasks.map(t => t.list).filter(id => {
        if (id && !unique.has(id)) {
          unique.add(id) 
          return id
        }
      })
    },
    presentFolder() {
      const unique = new Set()
      return this.allNonFilteredViewTasks.map(t => t.folder).filter(id => {
        if (id && !unique.has(id)) {
          unique.add(id) 
          return id
        }
      })
    },
  },
  watch: {
    viewName() {
      this.mainSelection = null
      this.mainSelectionIndex = null
    },
    presentTags() {
      this.$emit('present-tags', this.presentTags)
    },
    presentLists() {
      this.$emit('present-lists', this.presentLists)
    },
    presentFolders() {
      this.$emit('present-folders', this.presentFolders)
    },
    rootNonFiltered() {
      this.$emit('root-non-filtered', this.rootNonFiltered)
    },
    autoSchedule: {
      handler() {
        this.updateSchedule()
      },
      deep: true,
    }
  }
}

</script>
