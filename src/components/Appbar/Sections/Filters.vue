<template>
  <div class="Filters">
    <Renderer
      type="filter"
      icon="filter"
      :list="getLists"
      :active="active"
      :viewType="viewType"
      @update='update'
    />
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { mapState } from 'vuex'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('filter/updateOrder', ids)
    }
  },
  computed: {
    sortedFilters() {
      return this.$store.getters['filter/sortedFilters']
    },
    getLists() {
      let tags = this.sortedFilters.slice()
      for (const el of tags) {
        el.callback = () => {
          this.$router.push('/user?filter=' + el.name)
        }
        el.options = [
          {
            name: 'Edit filter',
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {
                comp: 'AddFilter', payload: el, naked: true,
              })
            },
          },
          {
            name: 'Delete filter',
            icon: 'trash',
            callback: () => {
              this.$store.dispatch('tag/deleteTag', el.id)
            }
          }
        ]
      }
      return tags
    },
  },
}

</script>
