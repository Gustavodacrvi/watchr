<template>
  <div class="ListHandler">
    <ListRendererVue v-if="!hideList"
      v-bind='$props'

      :items="sortLaseredLists"
      :headings='emptyArr'
      :showSomedayButton='showSomedayButton'
      :itemIconDropOptions='emptyArr'

      :addItem='addList'
      :getItemFirestoreRef='getItemFirestoreRef'
      :onAddExistingItem='onAddExistingItem'
      :disableSelect='true'
      :disableFallback='true'
      :rootFilterFunction='rootFilterFunction'
      :group='group'
      :onSortableAdd='onSortableAdd'
      
      comp='List'
      editComp='ListEdit'
      itemPlaceholder='List name...'

      @update="updateListIds"
      @allow-someday='allowSomeday'
    />
  </div>  
</template>

<script>

import ListRendererVue from './../Tasks/ListRenderer.vue'

import utilsTask from "@/utils/task"

import { mapState, mapGetters } from 'vuex'

import { listRef, serverTimestamp } from '@/utils/firestore'

import HandlerMixin from "@/mixins/handlerMixin"

import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

export default {
  mixins: [
    HandlerMixin,
  ],
  props: ['rootFilter', 'comp', 'itemsOrder', 'updateIds', 'movingButton', 'addItem', 'showCompleted', 'folderId', 'showSomeday', 'showSomeday',
  'removeListHandlerWhenThereArentLists'],
  components: {
    ListRendererVue,
  },
  methods: {
    allowSomeday() {
      this.$emit('allow-someday')
    },
    addList(obj) {
      const newObj = {
        ...obj,
        list: {
          ...obj.item,

          smartViewsOrders: {},
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
          headings: [],
          headingsOrder: [],
          tasks: [],
        },
        newListRef: obj.newItemRef,
      }
      this.fixPosition(newObj, this.nonFilteredIds, () => this.addItem(newObj))
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
              folder: this.folderId,
            })
            callback()
          },
          allowed: ['lists'],
        }
      })
    },
    updateListIds(ids) {
      this.updateIds(
        utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, this.nonFilteredIds)
      )
    },
    rootFilterFunction(list) {
      return true
    },
    onSortableAdd(o, ids, indicies, order) {
      this.$store.dispatch('task/convertTasksToListByIndex', {
        tasks: this.storeTasks.filter(el => ids.includes(el.id)), folderId: this.folderId, savedLists: this.storeLists, indicies, order,
      })
    },
  },
  computed: {
    ...mapGetters({
      storeLists: 'list/lists',
      storeFolders: 'folder/folders',
      storeTasks: 'task/tasks',
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',

      isListCompleted: 'list/isListCompleted',
      isListSomeday: 'list/isListSomeday',
    }),
    getFolder() {
      return this.storeFolders.find(el => el.id === this.folderId)
    },
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
    sortLaseredLists() {
      return this.nonFiltered.filter(this.filterOptions)
    },
    
    filterOptions() {
      return pipeBooleanFilters(
        list => this.isListCompletedPipe(list),
        this.isSomedayPipe,
      )
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
