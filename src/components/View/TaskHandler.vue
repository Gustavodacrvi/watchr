
<template>
  <div class="TaskHandler">
    <TaskRendererVue
      v-bind="$props"

      :mainTasks='mainTasks'
      :tasks='sortLaseredTasks'

      :headings='sortHeadings'

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
      <div v-if="hasAtLeastOneSomeday && !showSomeday" @click="allowSomeday">
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

export default {
  props: ['mainFilter', 'rootFilter', 'tasksOrder', 'headings', 'headingsOrder',

    'pipeFilterOptions', 'showCompleted', 'showSomeday',

    'headingEditOptions', 'taskIconDropOptions', 'onSortableAdd',
    'viewName', 'viewType', 'viewNameValue', 'mainFilterOrder', 'mainFallbackTask', 'icon', 'configFilterOptions',
    'taskCompletionCompareDate', 'rootFallbackTask',
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

    sortHeadings() {
      return this.sortHeadingsFunction(this.laserHeadingsTasks)
    },
    laserHeadingsTasks() {
      if (!this.headings) return []
      return this.headings.map(head => {
        const nonFiltered = head.sort(this.mainTasks.filter(task => head.filter(task)))
        const tasks = nonFiltered.filter(this.filterOptionsPipe)

        return {
          ...head,
          filter: undefined,
          tasks,
          filterFunction: pipeBooleanFilters(
            head.filter,
            this.mainFilterFunction,
          ),
          progress: head.progress ? head.progress() : undefined,
          onEdit: head.onEdit ? head.onEdit(nonFiltered) : () => {},
          options: head.options ? head.options(nonFiltered) : () => {},
          updateIds: ids => {
            head.updateIds(
              this.getFixedIdsFromNonFilteredAndFiltered(ids,
                nonFiltered.map(el => el.id),
              )
            )
          },
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

    filterOptionsPipe() {
      let pipes = [
        'pipeFilterOptions', 'pipeSomeday', 'pipeCompleted',
      ]

      if (this.configFilterOptions)
        pipes = pipes.filter(this.configFilterOptions)

      
      return pipeBooleanFilters(...pipes.map(p => this[p]))
    },
    hasAtLeastOneSomeday() {
      for (const task of this.mainTasks)
        if (this.isTaskSomeday(task))
          return true
      return false
    },
    pipeSomeday() {
      if (this.showSomeday) return () => true
      return task => !this.isTaskSomeday(task)
    },
    pipeCompleted() {
      if (this.showCompleted) () => true
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
