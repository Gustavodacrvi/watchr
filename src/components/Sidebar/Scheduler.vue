<template>
  <div class="Scheduler">
    <Calendar class="cal"
      v-model="date"
    
      :allowTaskAdd='true'
    />
    {{ date }}
  </div>
</template>

<script>

import Calendar from "@/components/Scheduling/Calendar.vue"

export default {
  components: {
    Calendar,
  },
  data() {
    return {
      date: '',
    }
  },
}

</script>

<style scoped>

.cal {
  width: calc(100% + 14px);
  transform: translateX(-14px);
}

</style>
