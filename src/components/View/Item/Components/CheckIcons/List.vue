<template>
  <div class="CheckIcon">
    <ListIcons
      :co='completed'
      :se='false'
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
    'canceled', 'item', 'itemModel',
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
      if (!this.item && !this.itemModel)
        return false
      return this.isListSomeday(this.itemModel || this.item)
    },
    getListProgress() {
      if (!this.item)
        return false
      return this.pieProgress(this.item.id)
    },
  },
}

</script>

<style scoped>

.CheckIcon {
  height: 100%;
  transform: translate(-1px, 2px);
}

</style>
