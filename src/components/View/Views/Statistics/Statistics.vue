<template>
  <div class="Statistics">
    <h3 class="title">Pomodoro</h3>
    <div class="wrapper">
      <Card
        title='Recent Data'
        descr='Predict the efficiency changes by comparing your activity in a certain period of time.'
        icon='pomo'
        color='var(--dark-red)'
      />
    </div>
  </div>
</template>

<script>

import Card from './Card.vue'

export default {
  components: {
    Card,
  },
}

</script>

<style scoped>

.wrapper {
  display: flex;
}

.title {
  margin: 18px;
}

</style>
