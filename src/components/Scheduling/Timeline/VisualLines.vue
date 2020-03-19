<template>
  <div class="VisualLines">
    <DivisionLine v-for="time in lines" :key="time.id"
      v-bind="time"
    />
  </div>
</template>

<script>

import DivisionLine from './Line.vue'

export default {
  components: {
    DivisionLine,
  },
  props: ['lines']
}

</script>
