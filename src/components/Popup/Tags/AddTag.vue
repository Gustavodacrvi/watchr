<template>
  <div class="AddTag popup cb shadow rb" :class="layout">
    <TagEdit
      :quickAdd='true'
      :isAdding='true'
      :listRenderer='false'
      :itemHeight='itemHeight'
      :itemModelFallback='{}'

      @save='addTag'
      @cancel="$emit('close')"
    />
  </div>
</template>

<script>

import TagEdit from "@/components/View/Item/Tag.vue"

import { mapGetters, mapState, mapActions } from 'vuex'

import mom from 'moment'

export default {
  components: {
    TagEdit,
  },
  created() {
    if (this.isEditing) this.name = this.payload.name
  },
  computed: {
    ...mapGetters({
      tags: 'tag/tags',
      layout: 'layout',
      itemHeight: 'itemHeight',
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
      if (!this.isEditing) return 'Add tag'
      return 'Edit tag'
    },
  },
  methods: {
    addTag(newTag) {
      const toast = (toast) => {
        this.$store.commit('pushToast', toast)
      }
      const tag = this.tags.find(el => el.name === newTag.name)
      if (!tag && !this.isEditing) {
        this.$store.dispatch('tag/addTag', {
          createdFire: new Date(),
          created: mom().format('Y-M-D HH:mm ss'),
          ...newTag,
          ...this.payload,
        })
        toast({
          name: `Tag added successfully!`,
          type: 'success',
          seconds: 2,
        })
      } else {
        toast({
          name: `This tag already exists!`,
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
