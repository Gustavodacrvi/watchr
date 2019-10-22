<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['New update!'] }}</h2>
    </div>
    <div class="content">
      <h3>Bug Fixes for Mobile</h3>
      <ul>
        <li>Task adder overflowing no mobile when having more than 3 tags.</li>
        <li>Strange task text behavior on mobile.</li>
      </ul>
      <h3>Features for Desktop</h3>
      <ul>
        <li>Open options on mouse right.</li>
      </ul>
      <Button @click="close" value="Got it!"/>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

import ButtonVue from '../Auth/Button.vue'

export default {
  components: {
    Button: ButtonVue,
  },
  methods: {
    close() {
      this.$store.commit('closePopup')
    },
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['l', 'platform']),
  }
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.Update.desktop {
  max-height: 350px;
}

.Update {
  overflow: auto;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--primary);
}

</style>
