<template>
  <div class="TaskView" :class="platform">
    <Header :smart="smart" :value="value" :options="options"/>
  </div>
</template>

<script>

import HeaderVue from './Header.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['smart', 'viewType', 'value'],
  components: {
    Header: HeaderVue,
  },
  data() {
    return {
      options: [
        {
          name: 'Sort tasks',
          icon: 'sort',
          callback: () => [
            {
              name: 'Sort by name',
              icon: 'sort-name',
            },
            {
              name: 'Sort by priority',
              icon: 'priority',
            },
            {
              name: 'Sort by date',
              icon: 'calendar',
            }
          ],
        },
        {
          name: 'Show completed',
          icon: 'completed',
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['platform'])
  },
}

</script>

<style scoped>

.TaskView {
  margin: 0 60px;
}

.TaskView.mobile {
  margin: 0 8px;
}

</style>
