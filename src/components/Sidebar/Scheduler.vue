<template>
  <div class="Scheduler">
    <SchedulerCalendar/>
  </div>
</template>

<script>

import SchedulerCalendar from "./Components/SchedulerCalendar.vue"

export default {
  components: {
    SchedulerCalendar,
  },
}

</script>

<style scoped>

.Scheduler {
  position: relative;
}

</style>
