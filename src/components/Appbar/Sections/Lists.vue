<template>
  <div class="Lists">
    <FolderRenderer
      type="list"
      icon="list"
      :list="getList"
      :active="active"
      :viewType="viewType"
      @update='update'
    />
  </div>
</template>

<script>

import FolderRendererVue from '../FolderRenderer.vue'

export default {
  components: {
    FolderRenderer: FolderRendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update() {

    },
    getFolderLists(id) {
      return this.$store.getters['list/getFolderLists'](id)
    }
  },
  computed: {
    sortedFolders() {
      return this.$store.getters['list/sortedFolders']
    },
    getList() {
      const folders = this.sortedFolders
      for (const fold of folders) {
        const lists = fold.lists.slice()
        fold.lists = this.getFolderLists(fold.id)
      }
      return folders
    },
  },
}

</script>
