<template>
  <div class="Scheduler">
    <Calendar class="cal"
      :allowTaskAdd='true'
    />
  </div>
</template>

<script>

import Calendar from "@/components/Scheduling/Calendar.vue"

export default {
  components: {
    Calendar,
  },
}

</script>

<style scoped>

.cal {
  width: calc(100% + 14px);
  transform: translateX(-14px);
}

</style>
