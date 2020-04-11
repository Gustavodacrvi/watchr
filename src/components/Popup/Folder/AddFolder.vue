<template>
  <div class="addFolder popup cb shadow rb" :class="layout">
    <FolderEdit
      :quickAdd='true'
      :isAdding='true'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      @save='addFolder'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import FolderEdit from "@/components/View/Item/Folder.vue"

import mom from 'moment'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    FolderEdit,
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters({
      itemHeight: 'itemHeight',
      layout: 'layout',
      folders: 'folder/folders',
    }),
    ...mapState({
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
  },
  methods: {
    addFolder(folder) {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      const fold = this.folders.find(el => el.name === folder.name)
      if (!fold && !this.isEditing) {
        this.$store.dispatch('folder/addFolder', {
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          ...folder,
        })
        toast({
          name: `Folder added successfully!`,
          type: 'success',
          seconds: 2,
        })
        this.$store.dispatch('closePopup')
      } else {
        toast({
          name: `This folder already exists!`,
          type: 'error',
          seconds: 3,
        })
      }
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
