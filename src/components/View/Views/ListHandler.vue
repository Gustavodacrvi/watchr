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

      @selectTask='selectTask'
      @unselectTask='unselectTask'
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
  props: ['rootFilter', 'comp', 'itemsOrder', 'updateIds', 'movingButton', 'addItem'],
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
    onAddExistingItem() {

    },
    updateListIds(ids) {
      this.updateIds(
        utilsTask.getFixedIdsFromNonFilteredAndFiltered(ids, this.nonFilteredIds)
      )
    },
    selectTask() {

    },
    unselectTask() {

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
    }),
    emptyArr() {
      return []
    },
    nonFilteredIds() {
      return this.nonFiltered.map(el => el.id)
    },
    sortLaseredLists() {
      return this.nonFiltered
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
