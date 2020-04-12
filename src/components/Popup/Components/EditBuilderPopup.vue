<template>
  <div class="AddList popup cb shadow rb" :class="layout">
    <component
      :is='comp'
      :quickAdd='true'
      :isAdding='true'
      :item='item'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      @save='saveItem'
      @cancel="$parent.$emit('close')"
    />
  </div>
</template>

<script>

import FolderEdit from "@/components/View/Item/Folder.vue"
import ListEdit from "@/components/View/Item/List.vue"
import TagEdit from "@/components/View/Item/Tag.vue"

import { mapGetters } from 'vuex'

import mom from 'moment'

export default {
  components: {
    FolderEdit,
    ListEdit, TagEdit,
  },
  props: ['item', 'save', 'comp', 'otherItems', 'errMsg', 'routeType'],
  methods: {
    saveItem(newItem) {

      if (this.item || !this.otherItems.some(el => el.name === newItem.name)) {
        this.save({
          ...newItem,
          ...(this.item ? {} : {
            createdFire: new Date(),
            created: mom().format('Y-M-D HH:mm ss'),
          })
        })
        this.$router.push(`/user?${this.routeType}=${newItem.name}`)
      } else {
        this.$store.commit('pushToast',{
          name: this.errMsg,
          type: 'error',
          seconds: 3,
        })
      }

    },
  },
  computed: {
    ...mapGetters({
      itemHeight: 'itemHeight',
      layout: 'layout',
      lists: 'list/lists',
    }),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
