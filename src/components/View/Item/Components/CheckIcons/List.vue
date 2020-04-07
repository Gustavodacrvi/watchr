<template>
  <div class="CheckIcons">
    <ListIcons
      :co='completed'
      :se='isSelecting'
      :ca='canceled'
      :ac='isItemSelected'
      :so='isSomeday'
      :progress='getListProgress'
    />
  </div>
</template>

<script>

import ListIcons from '../../../Lists/ListIcons.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'

export default {
  components: {
    ListIcons,
  },
  props: [
    'isItemSelected', 'isSelecting', 'completed',
    'canceled', 'forceDefault', 'item',
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
      if (!this.item) return 0
      return this.pieProgress(this.item.id)
    },
  },
}

</script>

<style scoped>

.CheckIcons {
  height: 100%;
  transform: translate(-1px, 2px);
}

</style>
