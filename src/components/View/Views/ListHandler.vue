<template>
  <div class="ListHandler">
    <ListRendererVue
      v-bind='$props'

      :items="lists"
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

      @update="updateIds"
      @allow-someday='allowSomeday'

      @selectTask='selectTask'
      @unselectTask='unselectTask'
    />
  </div>  
</template>

<script>

import ListRendererVue from './../Tasks/ListRenderer.vue'

import { mapState } from 'vuex'

export default {
  props: ['rootFilter', 'comp'],
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
    updateIds() {

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
    emptyArr() {
      return []
    },
    lists() {
      return this.storeLists.filter(this.rootFilter)
    },
  },
}

</script>

<style scoped>

.ListHandler {
  margin-top: 10px;
}

</style>
