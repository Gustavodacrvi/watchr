
<template>
  <div class="TaskHandler">
    <ListRendererVue
      ref='renderer'
    
      v-bind="$props"

      :items='sortLaseredTasks'

      :headings='sortHeadings'

      :addItem='addTask'
      :showSomedayButton='showSomedayButton'
      :rootFilterFunction='rootFilterFunction'
      :headingEditOptions='headingEditOptions'
      :itemIconDropOptions='taskIconDropOptions'
      :headingPosition='0'
      :updateHeadingIds='updateHeadingIds'
      :getItemFirestoreRef='getItemFirestoreRef'
      :onAddExistingItem='onAddExistingItem'
      comp='Task'
      editComp='TaskEdit'
      itemPlaceholder='Task name...'

      @update="updateIds"
      @add-heading="addHeading"
      @allow-someday='allowSomeday'

      @go='go'
      @selectItem='selectItem'
      @unselectItem='unselectItem'
    />
  </div>
</template>

<script>

import ListRendererVue from './../Tasks/ListRenderer.vue'
import AppButton from '../../Auth/Button.vue'

import { pipeBooleanFilters } from '@/utils/memo'
import { mapGetters, mapState, mapMutations } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils'

import mom from 'moment'

import { fire } from '@/store/'

import { taskRef, listRef, cacheBatchedItems } from '@/utils/firestore'

import HandlerMixin from "@/mixins/handlerMixin"

export default {
  mixins: [
    HandlerMixin,
  ],
  props: ['mainFilter', 'rootFilter', 'tasksOrder', 'headings', 'headingsOrder',

    'pipeFilterOptions', 'showCompleted', 'showSomeday', 
    'showHeadingFloatingButton', 'openCalendar', 'isSmart', 
    'calendarDate', 'updateViewIds', 'showingRuler',
    'width', 'disableRootActions', 'fallbackFunctionData',

    'headingEditOptions', 'taskIconDropOptions', 'filterByAssigned',
    'viewName', 'viewType', 'viewNameValue', 'mainFilterOrder', 'mainFallbackItem', 'icon', 'configFilterOptions', 'showHeading',
    'itemCompletionCompareDate', 'rootFallbackItem',
    'updateHeadingIds', 'showEmptyHeadings', 'showAllHeadingsItems',
  ],
  components: {
    ListRendererVue,
    AppButton,
  },
  data() {
    return {
      tempoOrder: {},
      order: [],
      tempoTimeout: null,
    }
  },
  created() {
    this.order = this.tasksOrder
  },
  methods: {
    applyAutoSchedule(autoSchedule, calendarDate) {
      this.$refs.renderer.applyAutoSchedule(autoSchedule, calendarDate)
    },
    saveAutoSchedule(info, headingId, calendarDate) {
      this.$refs.renderer.applyAutoScheduleToHeading(info, headingId, calendarDate)
    },
    addTaskEdit() {
      this.$refs.renderer.appendItem()
    },
    selectAll() {
      this.$refs.renderer.selectAll()
    },
    onAddExistingItem(index, lazyItems, fallbackItem, callback) {
      this.$store.dispatch('pushPopup', {
        comp: 'FastSearch', 
        payload: {
          callback: (route, task) => {
            lazyItems.splice(index, 0, task)
            const t = fallbackItem(task, true)
            this.$store.dispatch('task/saveTask', t)
            callback()
          },
          allowed: ['tasks'],
        }
      })
    },
    getItemFirestoreRef(heading) {
      if (!heading)
        return taskRef()
      return heading.listType ? listRef() : taskRef()
    },
    allowSomeday() {
      this.$emit('allow-someday')
    },

    addTask(obj, shouldRender) {
      const newObj = {
        ...obj,
        task: obj.item,
        newTaskRef: obj.newItemRef,
      }
      this.fixPosition(newObj, this.rootNonFilteredIds, async () => {
        const b = fire.batch()
        const writes = []


        await this.$store.dispatch('task/addViewTask', {
          b, ...newObj, writes,
        })
        this.order = newObj.ids.slice()

        this.updateViewIds(b, writes, {
          finalIds: newObj.ids,
          ...this.getUpdateIdsInfo()
        })

        cacheBatchedItems(b, writes)

        b.commit()
      })
    },
    updateIds({finalIds, b = fire.batch(), writes = []}) {
      this.updateViewIds(
        b,
        writes,
        {
          finalIds: utilsTask.getFixedIdsFromNonFilteredAndFiltered(finalIds, this.rootNonFilteredIds),
          ...this.getUpdateIdsInfo()
        }
      )

      this.order = finalIds.slice()

      cacheBatchedItems(b, writes)

      b.commit()
    },
    getUpdateIdsInfo() {
      return {
        viewName: this.viewName,
        viewType: this.viewType,

        rootState: this.$store.state,
        rootGetters: this.$store.getters,

        ...this.fallbackFunctionData(),
      }
    },
    addHeading(obj) {
      this.$parent.$emit('add-heading', {...obj})
    },
    notChar(s) {
      return s !== 'A' && s !== 'M' && s !== 'P'
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
      userInfo: state => state.userInfo,
      user: state => state.user,
    }),
    ...mapGetters({
      fallbackSelected: 'fallbackSelected',
      lists: 'list/lists',
      logLists: 'list/logLists',
      folders: 'folder/folders',
      tags: 'tag/tags',
      storeTasks: 'task/tasks',
      logTasks: 'task/logTasks',
      isTaskSomeday: 'task/isTaskSomeday',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskCanceled: 'task/isTaskCanceled',

      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',
    }),
    timeFormat() {
      return this.userInfo.disablePmFormat ? 'H:mm' : 'LT'
    },
    rootNonFilteredIds() {
      return this.rootNonFiltered.map(el => el.id)
    },
    allViewTasks() {
      return [...this.sortLaseredTasks,...this.sortHeadings.map(
        head => head.items
      ).flat()]
    },
    allItemsIds() {
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
      const mainTasks = this.mainTasks

      return headings.map(head => {
        const nonFiltered = !head.directFiltering ?
          head.sort(this.tempoOrder[head.id] || head.order || [],
            (!head.log ? mainTasks : this.logTasks).filter(task => head.filter(task))
          )
          : head.sort(this.tempoOrder[head.id] || head.order || [], (!head.listType ? this.storeTasks : (!head.log ? this.lists : this.logLists)).filter(item => head.filter(item)))

        if (head.react)
          for (const p of head.react) nonFiltered[p]

        const tasks = nonFiltered.filter(
          head.configFilterOptions ?
            pipeBooleanFilters(
              ...this.filterOptionsPipes.filter(head.configFilterOptions).map(p => this[p])
            )
           : this.filterOptionsPipe
        )

        const saveTempo = final => {
          this.tempoOrder[head.id] = final.slice()
          if (this.tempoTimeout)
            clearTimeout(this.tempoTimeout)
          this.tempoTimeout = setTimeout(() => {
            this.tempoOrder[head.id] = null
          }, 600)
        }

        let updateIds = ({finalIds, b = fire.batch(), writes = []}) => {
          const final = utilsTask.getFixedIdsFromNonFilteredAndFiltered(finalIds, nonFiltered.map(el => el.id))
          
          head.updateViewIds(
            b,
            writes,
            {
              finalIds: final,
              ...this.getUpdateIdsInfo(),
              ...head.fallbackFunctionData(),
            }
          )

          cacheBatchedItems(b, writes)

          saveTempo(final)

          b.commit()
        }

        const unshiftSortingOptions = options => {
          const opt = [
            {
              name: 'Sort tasks',
              icon: 'sort',
              callback: () => [
                {
                  name: 'Sort by name',
                  icon: 'sort-name',
                  callback: () => {
                    const ts = nonFiltered.slice()
                    tasks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                    updateIds(tasks.map(el => el.id))
                  },
                },
                {
                  name: 'Sort by priority',
                  icon: 'priority',
                  callback: () => {
                    const ts = utilsTask.sortTasksByPriority(tasks.slice())
                    updateIds(ts.map(el => el.id))
                  },
                },
                {
                  name: 'Sort by creation date',
                  icon: 'calendar',
                  callback: () => {
                    const ts = utilsTask.sortTasksByTaskDate(tasks.slice())
                    updateIds(ts.map(el => el.id))
                  },
                },
                {
                  name: 'Sort by duration(long to short)',
                  icon: 'magic',
                  callback: () => {
                    const ts = utilsTask.sortTasksByDuration(tasks.slice(), 'long')
                    updateIds(ts.map(el => el.id))
                  }
                },
                {
                  name: 'Sort by duration(short to long)',
                  icon: 'magic',
                  callback: () => {
                    const ts = utilsTask.sortTasksByDuration(tasks.slice(), 'short')
                    updateIds(ts.map(el => el.id))
                  }
                },
              ]
            },
          ]
          if ((head.calendarDate || this.calendarDate) && !head.listType)
            opt.push(utils.getAutoSchedulerIconDropObject(obj => {
              if (this.selectedItems.length === 0)
                this.saveAutoSchedule(obj, head.id, head.calendarDate || this.calendarDate)
              else this.$emit('auto-schedule-from-heading', {
                obj, calendarDate: head.calendarDate || this.calendarDate,
              })
            }, this.userInfo))
          if (options && options.length > 0)
            opt.push({
              type: 'hr',
              name: 'division',
            })
          return [...opt, ...options]
        }
        
        if (!head.updateViewIds)
          updateIds = undefined


        return {
          ...head,
          filter: undefined,
          items: tasks,
          nonFiltered,
          options: (tasks) => {
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
          onAddItem: obj => {
            const newObj = {
              ...obj,
              [head.listType ? 'list' : 'task']: obj.item,
              [head.listType ? 'newListRef' : 'newTaskRef']: obj.newItemRef,
            }
            this.fixPosition(newObj, nonFiltered.map(el => el.id), async () => {

              const b = fire.batch()
              const writes = []

              saveTempo(newObj.ids)

              head.updateViewIds(b, writes, {
                finalIds: newObj.ids,
                ...this.getUpdateIdsInfo(),
                ...head.fallbackFunctionData(),
              })

              if (!head.listType)
                await this.$store.dispatch('task/addViewTask', {
                  b, ...newObj, writes,
                })
              else
                await this.$store.dispatch('list/addViewList', {
                  b, ...newObj, writes,
                })

              cacheBatchedItems(b, writes)
              
              b.commit()
            })
          },
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
      const order = this.order
      return tasks => this.checkMissingIdsAndSortArr(order || [], tasks)
    },

    showSomedayButton() {
      return this.hasAtLeastOneSomeday &&
          !this.showSomeday &&
          this.filteredFilterOptionsByConfig.includes('pipeSomeday')
    },
    filterOptionsPipes() {
      return [
        'pipeCompleted', 'pipeSomeday', 'pipeCanceled', 'filterByAssignedPipe', 'pipeFilterOptions',
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
    filterByAssignedPipe() {
      if (!this.filterByAssigned) return () => true
      return t => t.assigned === this.user.uid
    },
    pipeCompleted() {
      if (this.showCompleted) return () => true
      return task => !this.isTaskCompleted(task, this.calendarDate, this.itemCompletionCompareDate)
    },
    pipeCanceled() {
      if (this.showCompleted) return () => true
      return task => !this.isTaskCanceled(task)
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
    presentFolders() {
      const unique = new Set()
      return this.allNonFilteredViewTasks.map(t => t.folder).filter(id => {
        if (id && !unique.has(id)) {
          unique.add(id) 
          return id
        }
      })
    },
    presentGroups() {
      const unique = new Set()
      return this.allNonFilteredViewTasks.map(t => t.group).filter(id => {
        if (id && !unique.has(id)) {
          unique.add(id) 
          return id
        }
      })
    },
  },
  watch: {
    presentTags() {
      this.$emit('present-tags', this.presentTags)
    },
    presentLists() {
      this.$emit('present-lists', this.presentLists)
    },
    presentFolders() {
      this.$emit('present-folders', this.presentFolders)
    },
    presentGroups() {
      this.$emit('present-groups', this.presentGroups)
    },
    rootNonFiltered() {
      this.$emit('root-non-filtered', this.rootNonFiltered)
    },
    tasksOrder() {
      this.order = this.tasksOrder.slice()
    },
  }
}

</script>
