<template>
  <ListIcons
    :co='completed'
    :se='isSelecting'
    :ca='canceled'
    :ac='isItemSelected'
    :so='isSomeday'
    :progress='getListProgress'
  />
</template>

<script>

import ListIcons from '../../../Lists/ListIcons.vue'
import { mapGetters } from 'vuex'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    ListIcons,
  },
  props: [
    'movingItem', 'isSelecting', 'completed',
    'canceled', 'forceDefault',
    
    'name', 'priority', 'id', 'calendar',
  ],
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      isListSomeday: 'list/isListSomeday',
      pieProgress: 'list/pieProgress',
    }),

    isSomeday() {
      return this.isListSomeday(this.item)
    },
    getListProgress() {
      return this.pieProgress(this.item.id)
    },
  },
}

</script>
