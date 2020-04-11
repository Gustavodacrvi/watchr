<template>
  <div class="AddList popup cb shadow rb" :class="layout">
    <ListEdit
      :quickAdd='true'
      :isAdding='true'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      @save='addList'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import ListEdit from "@/components/View/Item/List.vue"

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

export default {
  components: {
    ListEdit,
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters({
      itemHeight: 'itemHeight',
      layout: 'layout',
      lists: 'list/lists',
    }),
    ...mapState({
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
  },
  methods: {
    addList(newList) {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }

      const list = this.lists.find(el => el.name === newList.name)
      if (!list && !this.isEditing) {
        this.$store.dispatch('list/saveList', {
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          ...newList,
        })
        toast({
          name: `List added successfully!`,
          type: 'success',
          seconds: 2,
        })
      } else {
        toast({
          name: `This list already exists!`,
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
