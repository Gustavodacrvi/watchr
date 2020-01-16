<template>
  <div class="ListHandler">
    <ListRendererVue
      v-bind='$props'

      :items="[]"
      :headings='[]'
      :showSomedayButton='false'
      :itemIconDropOptions='[]'

      :addItem='addList'
      :getItemFirestoreRef='getItemFirestoreRef'
      :onAddExistingItem='onAddExistingItem'
      
      comp='List'
      editComp='ItemEdit'
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
}

</script>
