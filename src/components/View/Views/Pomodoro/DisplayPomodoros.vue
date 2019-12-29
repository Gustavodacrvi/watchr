<template>
  <div class="DisplayPomodoros">
    <PomoCard class="pomo"
      v-bind="{
        name: 'Default',
        duration: '00:25',
        shortInterval: '00:05',
        longInterval: '00:20',
      }"
    />
    <PomoCard class="pomo"
      v-bind="{
        name: 'Pomo 2',
        duration: '00:10',
        shortInterval: '01:00',
        longInterval: '00:50',
      }"
    />
  </div>
</template>

<script>

import PomoCard from './PomoCard.vue'

export default {
  components: {
    PomoCard,
  },
}

</script>

<style scoped>

.DisplayPomodoros {
  display: flex;
}

.pomo + .pomo {
  margin-left: 16px;
}

</style>
