<template>
  <div class="ListHandler">
    <ListRendererVue
      v-bind='$props'
      ref='renderer'

      :items="sortLaseredLists"
      :headings='emptyArr'
      :showSomedayButton='showSomedayButton'

      :addItem='addList'
      :getItemFirestoreRef='getItemFirestoreRef'
      :onAddExistingItem='onAddExistingItem'
      :itemIconDropOptions='taskIconDropOptions'
      :disableFallback='true'
      :rootFilterFunction='rootFilterFunction'
      :group='group'
      :onSortableAdd='onSortableAdd'
      
      comp='List'
      editComp='List'
      itemPlaceholder='List name...'

      @update="updateIds"
      @allow-someday='allowSomeday'

      @go='go'
      @selectItem='selectItem'
      @unselectItem='unselectItem'
    />
  </div>  
</template>

<script>

import ListRendererVue from './../Tasks/ListRenderer.vue'

import utilsTask from "@/utils/task"

import { mapState, mapGetters } from 'vuex'

import { fire } from '@/store/'

import { listRef, cacheBatchedItems } from '@/utils/firestore'

import HandlerMixin from "@/mixins/handlerMixin"

import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

export default {
  mixins: [
    HandlerMixin,
  ],
  props: ['rootFilter', 'comp', 'itemsOrder', 'updateViewIds', 'addItem', 'showCompleted', 'folderId', 'groupId', 'showSomeday', 'showSomeday',
  'taskIconDropOptions', 'width', 'removeListHandlerWhenThereArentLists', 'filterByAssigned', 'viewName', 'viewType', 'fallbackFunctionData', 'mainFallbackItem', 'itemModelFallback'],
  components: {
    ListRendererVue,
  },
  methods: {
    toggleCompletion(ids) {
      this.$refs.renderer.toggleCompletion(ids)
    },
    
    selectAll() {
      this.$refs.renderer.selectAll()
    },
    addItemEdit() {
      this.$refs.renderer.appendItem()
    },
    allowSomeday() {
      this.$emit('allow-someday')
    },
    addList(obj) {
      const newObj = {
        ...obj,
        list: {
          ...obj.item,

          smartViewsOrders: {},
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          headings: [],
          headingsOrder: [],
          tasks: [],
        },
        newListRef: obj.newItemRef,
      }
      this.fixPosition(newObj, this.nonFilteredIds, async () => {
        const b = fire.batch()
        const writes = []


        await this.$store.dispatch('list/addViewList', {
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
    getItemFirestoreRef() {
      return listRef()
    },
    onAddExistingItem(index, lazyItems, fallbackItem, callback) {
      this.$store.dispatch('pushPopup', {
        comp: 'FastSearch',
        payload: {
          callback: (route, list) => {
            lazyItems.splice(index, 0, list)
            this.$store.dispatch('list/saveList', {
              ...list,
              folder: this.folderId || null,
              group: this.groupId || null,
            })
            callback()
          },
          allowed: ['lists'],
        }
      })
    },
    updateIds({finalIds, b = fire.batch(), writes = []}) {
      this.updateViewIds(
        b,
        writes,
        {
          finalIds: utilsTask.getFixedIdsFromNonFilteredAndFiltered(finalIds, this.nonFilteredIds),
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
    rootFilterFunction(list) {
      return true
    },
    onSortableAdd(order, ids) {
      this.$store.dispatch('task/convertTasksToListByIndex', {
        tasks: this.storeTasks.filter(el => ids.includes(el.id)),
        folder: this.folderId || null,
        group: this.groupId || null,
        savedLists: this.storeLists, indicies, order,
      })
    },
  },
  computed: {
    ...mapState({
      user: state => state.user,
    }),
    ...mapGetters({
      storeLists: 'list/lists',
      storeFolders: 'folder/folders',
      storeTasks: 'task/tasks',
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',

      isListCompleted: 'list/isListCompleted',
      isListCanceled: 'list/isListCanceled',
      isListSomeday: 'list/isListSomeday',
    }),
    hideList() {
      return this.removeListHandlerWhenThereArentLists && this.isViewEmpty
    },
    isViewEmpty() {
      return this.nonFiltered.length === 0
    },
    group() {
      return {
        name: 'item-renderer',
        pull: (e,j,item) => {
          const type = item.dataset.type
          if (type === 'Task') return true
          return false
        },
        put: (j,o,item) => {
          const d = item.dataset
          const type = d.type
          if (type === 'Task') return true
          if (type === 'headingbutton' || type === 'add-task-floatbutton')  
            return true
          return false
        }
      }
    },
    emptyArr() {
      return []
    },
    nonFilteredIds() {
      return this.nonFiltered.map(el => el.id)
    },
    allItemsIds() {
      return this.sortLaseredLists.map(el => el.id)
    },
    sortLaseredLists() {
      return this.nonFiltered.filter(this.filterOptions)
    },
    
    filterOptions() {
      return pipeBooleanFilters(
        list => this.isListCompletedPipe(list),
        list => this.isListCanceledPipe(list),
        this.isSomedayPipe,
        this.filterByAssignedPipe,
      )
    },
    filterByAssignedPipe() {
      if (!this.filterByAssigned) return () => true
      return l => l.assigned === this.user.uid
    },
    isSomedayPipe() {
      if (this.showSomeday) return () => true
      return list => !this.isListSomeday(list)
    },

    hasAtLeastOneSomeday() {
      return this.nonFiltered.some(this.isListSomeday)
    },
    showSomedayButton() {
      return this.hasAtLeastOneSomeday &&
          !this.showSomeday
    },
    isListCompletedPipe() {
      return this.showCompleted ?
        () => true :
        list => !this.isListCompleted(list)
    },
    isListCanceledPipe() {
      return this.showCompleted ?
        () => true :
        list => !this.isListCanceled(list)
    },
    nonFiltered() {
      return this.sortFunction(this.storeLists.filter(this.rootFilter))
    },
    sortFunction() {
      const order = this.itemsOrder
      return lists => this.checkMissingIdsAndSortArr(order || [], lists)
    },
  },
}

</script>
