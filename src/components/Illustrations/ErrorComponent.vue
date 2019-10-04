<template>
  <div class="ErrorComponent">
    <IllustrationError class="illustration-colors"
      name="Error"
      :title="l['Some error occurred, please try again later.']"
    />  
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import IllustrationVue from './Illustration.vue'

export default {
  components: {
    IllustrationError: IllustrationVue,
  },
  computed: {
    ...mapGetters(['l']),
  }
}

</script>

<style scoped>

.ErrorComponent {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-grow: 1;
}

</style>
