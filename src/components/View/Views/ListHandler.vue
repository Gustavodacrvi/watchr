<template>
  <div class="ListHandler">
    <ListRendererVue
      v-bind='$props'

      :items="sortLaseredLists"
      :headings='emptyArr'
      :showSomedayButton='false'
      :itemIconDropOptions='emptyArr'

      :addItem='addList'
      :getItemFirestoreRef='getItemFirestoreRef'
      :onAddExistingItem='onAddExistingItem'
      :disableSelect='true'
      :disableFallback='true'
      :rootFilterFunction='rootFilterFunction'
      
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

import mom from 'moment'

export default {
  mixins: [
    HandlerMixin,
  ],
  props: ['rootFilter', 'comp', 'itemsOrder', 'updateIds', 'movingButton', 'addItem', 'showCompleted', 'folderId'],
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
  },
  computed: {
    ...mapState({
      storeLists: state => state.list.lists,
    }),
    ...mapGetters({
      checkMissingIdsAndSortArr: 'checkMissingIdsAndSortArr',

      isListCompleted: 'list/isListCompleted',
    }),
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

<style scoped>

.ListHandler {
  margin-top: 10px;
}

</style>
