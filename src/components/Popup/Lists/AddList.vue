<template>
  <div class="AddList popup cb shadow rb" :class="layout">
    <ListEdit
      :quickAdd='true'
      :isAdding='true'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      placeholder="Task name..."
      notesPlaceholder="Notes..."
      @save='addList'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import ListEdit from "@/components/View/Item/List.vue"

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ListEdit,
  },
  data() {
    return {
      name: '',
      options: [],
    }
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters({
      itemHeight: 'itemHeight',
      layout: 'layout',
      isSmartList: 'isSmartList',
      lists: 'list/lists',
    }),
    ...mapState({
      popup: state => state.popup,
      payload: state => state.popup.payload,
    }),
    isEditing() {
      if (!this.payload) return false
      return this.payload.editing === true
    },
    title() {
      if (!this.isEditing) return 'Add list'
      return 'Edit list'
    },
  },
  methods: {
    addList() {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      if (this.name) {
        const list = this.lists.find(el => el.name === this.name)
        if (!list && !this.isEditing) {
          this.$store.dispatch('list/addList', {
            name: this.name,
            ...this.payload,
          })
          toast({
            name: `List added successfully!`,
            type: 'success',
            seconds: 2,
          })
        } else if (!list && this.isEditing) {
          this.$store.dispatch('list/saveList', {
            name: this.name,
            id: this.payload.id,
          })
          toast({
            name: `List edited successfully!`,
            type: 'success',
            seconds: 2,
          })
          this.$store.dispatch('closePopup')
        } else {
          toast({
            name: `This list already exists!`,
            type: 'error',
            seconds: 3,
          })
        }
      } else {
        toast({
          name: 'Fill in all the required fields.',
          type: 'error',
          seconds: 3,
        })
      }
    },
    select(val) {
      this.name = val
      setTimeout(() => {
        this.options = []
      })
    }
  },
  watch: {
    name() {
      this.options = this.lists.filter(el => el.name.toLowerCase().includes(this.name.toLowerCase())).map(el => el.name)
    }
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
