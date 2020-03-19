<template>
  <div class="Scheduler">
    <div class="content">
      <div
        class="cal"
        ref='cal'
      >
        <Calendar
          v-model="date"
        
          :allowTaskAdd='true'
        />
      </div>
      <Timeline :date='date'/>
    </div>
  </div>
</template>

<script>

import Calendar from "@/components/Scheduling/Calendar.vue"
import Timeline from "@/components/Scheduling/Timeline/Timeline.vue"

export default {
  components: {
    Calendar, Timeline,
  },
  data() {
    return {
      date: '',
    }
  },  
}

</script>

<style scoped>

.Scheduler {
  max-height: 100%;
  overflow: hidden;
}

.content {
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.cal {
  position: sticky;
  top: 0;
  z-index: 1;
  width: calc(100% + 14px);
  transform: translateX(-14px);

  background-color: var(--sidebar-color);
}

</style>
