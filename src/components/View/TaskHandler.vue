
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
      const notFilteredIds = this.notFilteredIds

      let fixPosition = 0
      let i = 0
      for (const id of notFilteredIds) {
        if (!obj.ids.includes(id))
          fixPosition++
        if ((i - fixPosition) === obj.index) break
        i++
      }

      obj.index += fixPosition
      obj.ids = notFilteredIds
      this.$parent.$emit('add-task', obj)
    },
    updateIds(ids) {
      const notFilteredIds = this.notFilteredIds
      const removedIncludedIds = notFilteredIds.slice().filter(id => !ids.includes(id))

      const final = []
      let missing = []
      let i = 0
      for (const id of notFilteredIds) {
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
      doesTaskPassExclusiveFolder: 'task/doesTaskPassExclusiveFolder',
      doesTaskPassInclusiveFolder: 'task/doesTaskPassInclusiveFolder',
      doesTaskPassExclusiveList: 'task/doesTaskPassExclusiveList',
      doesTaskPassInclusiveList: 'task/doesTaskPassInclusiveList',
      doesTaskPassExclusiveTags: 'task/doesTaskPassExclusiveTags',
      doesTaskPassInclusiveTags: 'task/doesTaskPassInclusiveTags',
      isTaskSomeday: 'task/isTaskSomeday',
      isTaskCompleted: 'task/isTaskCompleted',

      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    notFilteredIds() {
      return this.mainTasks.map(el => el.id)
    },

    sortHeadings() {
      return this.sortHeadingsFunction(this.laserHeadingsTasks)
    },
    laserHeadingsTasks() {
      return this.headings.map(head => ({
        ...head,
        filter: undefined,
        tasks: head.sort(this.mainTasks.filter(head.filter))
      }))
    },

    sortLaseredTasks() {
      // console.time('tasks sorting')
      const res = this.sortTasksFunction(this.laserTasks)
      // console.timeEnd('tasks sorting')
      return res
    },
    laserTasks() {
      // console.time('filtered lasering')
      const res = this.mainTasks.filter(this.rootPipe)
      // console.timeEnd('filtered lasering')
      return res
    },
    mainTasks() {
      // console.time('nonFiltered lasering')
      const res = this.storeTasks.filter(this.mainPipe)
      // console.timeEnd('nonFiltered lasering')
      return res
    },

    sortHeadingsFunction() {
      return headings => {
        return this.checkMissingIdsAndSortArr(this.headingsOrder() || [], headings)
      }
    },
    sortTasksFunction() {
      return tasks => {
        return this.checkMissingIdsAndSortArr(this.tasksOrder() || [], tasks)
      }
    },

    mainPipe() {
      return pipeBooleanFilters(
        this.mainFilter,
        this.pipeFilterOptions,
        this.pipeSomeday,
        this.pipeCompleted,
      )
    },
    rootPipe() {
      return pipeBooleanFilters(
        this.mainFilter,
        this.rootFilter,
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
