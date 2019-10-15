<template>
  <div class="Signup popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 class="pc">{{ l['Sign up option'] }}</h3>
    </div>
    <div class="content">
      <div class="card cursor rb">
        <img src="https://d3ptyyxy2at9ui.cloudfront.net/google-41de20.svg" alt="goggle">
        <span class="name">{{ l['Sign up with google'] }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

export default {
  methods: {

  },
  computed: {
    ...mapGetters(['platform', 'l'])
  },
}

</script>

<style scoped>

.card {
  border: 1px solid var(--light-gray);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  transition: background-color .2s;
}

.card:hover {
  background-color: var(--light-gray);
}

.card + .card {
  margin-top: 30px;
}

.name {
  margin-left: 8px;
}

</style>

<style scoped src="@/assets/css/popupAuth.css">
</style>
