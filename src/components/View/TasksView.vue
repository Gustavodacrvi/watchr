<template>
  <div class="TaskView">
    <Header :smart="smart" :value="value" :options="options"/>
  </div>
</template>

<script>

import HeaderVue from './Header.vue'

export default {
  props: ['smart', 'viewType', 'value'],
  components: {
    Header: HeaderVue,
  },
  data() {
    return {
      options: [
        {
          name: 'Link 1',
          icon: 'sun'
        }
      ]
    }
  }
}

</script>

<style scoped>

.TaskView {
  margin: 0 60px;
}

</style>
