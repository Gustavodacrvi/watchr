
<template>
  <div class="TaskHandler">
    <TaskRendererVue
      v-bind="$props"

      :mainTasks='mainTasks'
      :tasks='sortLaseredTasks'

      :headings='sortHeadings'

      :addTask='addTask'
      :headingEditOptions='headingEditOptions'
      :taskIconDropOptions='taskIconDropOptions'
      :headingPosition='0'
      @update="updateIds"
      @update-headings='updateHeadingIds'
      @add-heading="addHeading"
    />
    <transition name="fade-t">
      <div v-if="hasAtLeastOneSomeday && !showSomeday" @click="showSomeday = true">
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
    'viewName', 'viewType', 'viewNameValue', 'mainFilterOrder',
  ],
  components: {
    TaskRendererVue,
    AppButton,
  },
  methods: {
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
      const rootNonFilteredIds = this.rootNonFilteredIds
      const removedIncludedIds = rootNonFilteredIds.slice().filter(id => !ids.includes(id))

      const final = []
      let missing = []
      let i = 0
      for (const id of rootNonFilteredIds) {
        if (removedIncludedIds.includes(id))
          final.push(id)
        else missing.push(i)

        i++
      }
      i = 0
      for (const id of ids) {
        removedIncludedIds.splice(missing[i], 0, id)
        i++
      }

      this.$parent.$emit('update-ids', removedIncludedIds)
    },
    updateHeadingIds(ids) {
      this.$parent.$emit("update-heading-ids", ids)
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
      return this.headings.map(head => ({
        ...head,
        filter: undefined,
        tasks: head.sort(this.mainTasks.filter(
          pipeBooleanFilters(
            head.filter,
            this.filterOptionsPipe,
          )
        ))
      }))
    },

    sortLaseredTasks() {
      return this.rootNonFiltered.filter(this.filterOptionsPipe)
    },
    rootNonFiltered() {
      return this.sortTasksFunction(this.mainTasks.filter(this.rootFilter))
    },
    mainTasks() {
      return this.storeTasks.filter(this.mainFilter)
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
      return pipeBooleanFilters(
        this.pipeFilterOptions,
        this.pipeSomeday,
        this.pipeCompleted,
      )
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
  }
}

</script>
