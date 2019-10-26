<template>
  <div class="Update popup cb shadow rb scroll-thin" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['New update!'] }}</h2>
    </div>
    <div class="content">
      <h3>Bug Fixes</h3>
      <ul>
        <li>Couldn't sign up on mobile.</li>
      </ul>
      <h3>Improvements</h3>
      <ul>
        <li>App should <b><i>"theoretically"</i></b> load 1 to 3 seconds faster.</li>
      </ul>
      <h3>Features</h3>
      <ul>
        <li>Add/Change username.</li>
        <li>Change account e-mail.</li>
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
