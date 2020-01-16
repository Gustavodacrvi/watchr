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
      
      comp='List'
      editComp='EditComp'
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

export default {
  props: ['rootFilter', 'comp', 'itemsOrder', 'updateIds'],
  components: {
    ListRendererVue,
  },
  methods: {
    allowSomeday() {
      this.$emit('allow-someday')
    },
    addList() {

    },
    getItemFirestoreRef() {

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
