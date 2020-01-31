<template>
  <div class="Filters">
    <Renderer
      v-bind="$props"

      type="filter"
      icon="filter"
      iconColor='var(--dark-blue)'
      :enableSort='true'
      :list="getFilters"
      :mapNumbers='numberOfTasks'
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'

import { mapState, mapGetters } from 'vuex'

// import utilsFilter from '@/utils/filter'

export default {
  components: {
    Renderer: RendererVue,
  },
  props: ['active', 'viewType'],
  methods: {
    update(ids) {
      this.$store.dispatch('filter/updateOrder', ids)
    },
    numberOfTasks(filter) {
      return {
        total: this.getNumberOfTasksByFilter(filter.id).total,
      }
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddFilter', payload: {...obj}, naked: true})
    }
  },
  computed: {
    ...mapState(['selectedItems']),
    ...mapGetters({
      getNumberOfTasksByFilter: 'task/getNumberOfTasksByFilter',
      isDesktop: 'isDesktop',
    }),
    sortedFilters() {
      return this.$store.getters['filter/sortedFilters']
    },
    getFilters() {
      let filters = this.sortedFilters.slice()
      for (const filter of filters) {
        filter.callback = () => {
          this.$router.push('/user?filter=' + filter.name)
        }
        filter.options = utilsFilter.filterOptions(filter)
      }
      return filters
    },
  },
}

</script>
