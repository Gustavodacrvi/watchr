
<template>
  <div class="TaskHandler">
    <TaskRendererVue
      v-bind="$props"

      :mainTasks='mainTasks'
      :tasks='sortLaseredTasks'

      :headings='sortHeadings'
      :scheduleObject='scheduleObject'

      :addTask='addTask'
      :rootFilterFunction='rootFilterFunction'
      :headingEditOptions='headingEditOptions'
      :taskIconDropOptions='taskIconDropOptions'
      :headingPosition='0'
      :updateHeadingIds='updateHeadingIds'
      @update="updateIds"
      @add-heading="addHeading"
    />
    <transition name="fade-t">
      <div v-if="showSomedayButton" @click="allowSomeday">
        <AppButton type="dark" :value="l['Show someday tasks...']"/>
      </div>
    </transition>
  </div>
</template>

<script>

import TaskRendererVue from './Tasks/TaskRenderer.vue'
import AppButton from '../Auth/Button.vue'

import { pipeBooleanFilters } from '@/utils/memo'
import { mapGetters, mapState } from 'vuex'

import utilsTask from '@/utils/task'

import mom from 'moment/src/moment'

export default {
  props: ['mainFilter', 'rootFilter', 'tasksOrder', 'headings', 'headingsOrder',

    'pipeFilterOptions', 'showCompleted', 'showSomeday',

    'headingEditOptions', 'taskIconDropOptions', 'onSortableAdd',
    'viewName', 'viewType', 'viewNameValue', 'mainFilterOrder', 'mainFallbackTask', 'icon', 'configFilterOptions',
    'taskCompletionCompareDate', 'rootFallbackTask', 'autoSchedule',
    'updateHeadingIds', 'showEmptyHeadings', 'showAllHeadingsItems',
  ],
  components: {
    TaskRendererVue,
    AppButton,
  },
  methods: {
    allowSomeday() {
      this.$emit('allow-someday')
    },
    getFixedIdsFromNonFilteredAndFiltered(filtered, nonFiltered) {
      const removedIncludedIds = nonFiltered.slice().filter(id => !filtered.includes(id))

      let missing = []
      let i = 0
      for (const id of nonFiltered) {
        if (!removedIncludedIds.includes(id))
          missing.push(i)

        i++
      }
      i = 0
      for (const id of filtered) {
        removedIncludedIds.splice(missing[i], 0, id)
        i++
      }

      return removedIncludedIds
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
      this.$parent.$emit('update-ids', this.getFixedIdsFromNonFilteredAndFiltered(ids, this.rootNonFilteredIds))
    },
    addHeading(obj) {
      this.$parent.$emit('add-heading', {...obj})
    },
  },
  computed: {
    ...mapState({
      storeTasks: state => state.task.tasks,
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      l: 'l',
      isTaskSomeday: 'task/isTaskSomeday',
      isTaskCompleted: 'task/isTaskCompleted',

      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    rootNonFilteredIds() {
      return this.rootNonFiltered.map(el => el.id)
    },
    scheduleObject() {
      if (!this.autoSchedule) return null
      
      const { time, buffer, fallback } = this.autoSchedule
      
      const init = mom(time, 'HH:mm')

      let headingTasks = []

      for (const t of this.sortHeadings)
        headingTasks = [...headingTasks, ...t.tasks]

      const tasks = [
        ...this.sortLaseredTasks,
        ...headingTasks,
      ]

      const bufferSplit = buffer.split(':')

      const finalObj = {}

      const format = this.userInfo.disablePmFormat ? 'H:mm' : 'LT'

      const notChar = s => s !== 'A' && s !== 'M' && s !== 'P'

      let i = 0
      for (const t of tasks) {
        const start = init.format(format)
        const split = start.split(':')

        const region = init.format('a')

        const startHour = split[0]
        let startMin = ''
        const startSplit = split[1]
        for (const s of startSplit)
          if (notChar(s))
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
          if (notChar(s))
            endMin += s

        init.add(parseInt(bufferSplit[0], 10), 'h')
        init.add(parseInt(bufferSplit[1], 10), 'm')

        const obj = {
          id: t.id,
          buffer, region,
          index: i,
          start, startHour, startMin,
          end, endHour, endMin,
        }

        finalObj[t.id] = obj

        i++
      }

      return finalObj
    },

    sortHeadings() {
      return this.sortHeadingsFunction(this.laserHeadings)
    },
    laserHeadings() {
      if (!this.headings) return []
      return this.headings.map(head => {
        const nonFiltered = head.sort(this.mainTasks.filter(task => head.filter(task)))
        const tasks = nonFiltered.filter(this.filterOptionsPipe)

        let updateIds = ids =>
            head.updateIds(
              this.getFixedIdsFromNonFilteredAndFiltered(ids,
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
      for (const task of this.rootNonFiltered)
        if (this.isTaskSomeday(task))
          return true
      for (const head of this.laserHeadings)
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
  },
  watch: {
    rootNonFiltered() {
      this.$emit('root-non-filtered', this.rootNonFiltered)
    },
  }
}

</script>
