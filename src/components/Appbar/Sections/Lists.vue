<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      :list="getList"
      :active="active"
      :viewType="viewType"
      @update='update'
    />
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
  },
  computed: {
    sortedLists() {
      return this.$store.getters['list/sortedLists']
    },
    getList() {
      const lists = this.sortedLists
      return lists
    },
  },
}

</script>
