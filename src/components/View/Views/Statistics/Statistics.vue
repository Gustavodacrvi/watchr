<template>
  <div class="Statistics" :class="platform">
    <h3 class="title">Pomodoro</h3>
    <div class="wrapper">
      <Card class="card"
        title='Recent Data'
        descr='Predict the efficiency changes by comparing your activity in a certain period of time.'
        icon='pomo'
        color='var(--dark-red)'
        @click='click'
      />
    </div>
  </div>
</template>

<script>

import Card from './Card.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    Card,
  },
  methods: {
    pop(comp) {
      this.$store.dispatch('pushPopup', {
        comp,
      })
    },
    click() {
      this.pop('RecentData')
    },
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

.mobile .wrapper {
  justify-content: center;
  flex-wrap: wrap;
}

.mobile .card + .card {
  margin-top: 16px;
}

</style>
