<template>
  <div class="Scheduler">
    <SchedulerCalendar v-model="obj"/>
    <ItemList v-bind='obj'/>
  </div>
</template>

<script>

import SchedulerCalendar from "./Components/SchedulerCalendar.vue"
import ItemList from "./Components/ItemList.vue"

export default {
  components: {
    SchedulerCalendar,
    ItemList,
  },
  data() {
    return {
      obj: null,
    }
  },
}

</script>

<style scoped>

.Scheduler {
  position: relative;
}

</style>
