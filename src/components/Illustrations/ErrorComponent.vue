<template>
  <IllustrationError class="illustration-colors"
    name="Error"
    :title="l['Some error occurred, please try again later.']"
  />  
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
