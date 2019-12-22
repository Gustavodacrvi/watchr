<template>
  <div class="priority">
    <span>{{ l['Must have at least one of:'] }}</span>
    <RadioOptions
      :options='radioOptions'
    />
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import RadioOptions from '@/components/Auth/RadioOptions.vue'

export default {
  components: {
    RadioOptions,
  },
  props: ['options'],
  created() {

  },
  computed: {
    ...mapGetters(['l']),
    radioOptions() {
      return [
        'No priority',
        'Low priority',
        'Medium priority',
        'High priority',
      ]
    },
  }
}

</script>

<style scoped>

</style>
