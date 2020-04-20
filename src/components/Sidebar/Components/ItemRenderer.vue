<template>
  <div class="ItemRenderer"
    :class="{notMoving: !moving}"
    @click="rootClick"
  >
    <transition-group
      name="flip-list"
      appear
      ref='item-renderer-root'
      class="item-renderer-root"

      tag='div'

      @enter='enter'
      @leave='leave'
    >
      <Item v-for="t in lazyItems" :key="t.id"
        :ref='t.id'
        :item='t'

        :listRenderer='true'
        :sidebarRenderer='true'
        :isSelecting='false'
        :multiSelectOptions='[]'
        comp='Task'

        @de-select='deSelectItem'
        @select='selectItem'

        :data-id='t.id'
        :data-name='t.name'
        data-type='Task'
        data-transition='display'
      />
    </transition-group>
  </div>
</template>

<script>

import Item from "@/components/View/Item/Task.vue"

import { Sortable } from 'sortablejs'

import { mapGetters, mapState } from 'vuex'

import listMixin from "@/mixins/listRendering.js"

export default {
  mixins: [listMixin],
  components: {
    Item,
  },
  props: ['name'],
  data() {
    return {
      sortable: null,
      comp: "Task",
    }
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      multiDrag: true,
      direction: 'vertical',

      animation: 200,
      forceFallback: true,
      fallbackOnBody: true,
      delay: 100,
      handle: '.item-handle',

      onUpdate: this.sortableOnUpdate,
      onSelect: this.sortableOnSelect,
      onDeselect: this.onSortableDeselect,
      onRemove: this.onSortableRemove,

      pull: (e,j,item) => {
        const d = item.dataset
        const sortableRootName = e.el.dataset.name
        
        if (sortableRootName === 'sidebar-renderer') return true
        if (sortableRootName === 'folders-root') return true
        if (sortableRootName === 'scheduler' && this.comp === "Task") return true
        if (d.type === 'Task' && this.comp === "Task") return true
        if (d.type === 'List' && this.comp === 'List') return true
        return false
      },
      put: (j,o,item) => {
        const d = item.dataset
        const type = d.type
        if (type === 'headingbutton' || type === 'add-task-floatbutton') return !this.disableRootActions
        if (type === 'sidebar-element') return true
        if (!this.allowSortableAdd) return false
        if (type === 'Task' && this.comp === "Task") return true
        if (type === 'List' && this.comp === 'List') return true
        if (type === 'subtask') return true
        return false
      },
    })
  },
  computed: {
    ...mapGetters({
      storeTasks: 'task/tasks',
      isTaskInView: 'task/isTaskInView',
    }),

    draggableRoot() {
      return this.$refs['item-renderer-root'].$el
    },
    lazyItems() {
      return this.storeTasks.filter(t => this.isTaskInView(t, this.name))
    },
  },
}

</script>

<style scoped>

.item-renderer-root {
  position: relative;
  min-height: 25px;
  z-index: 1;
}

</style>
