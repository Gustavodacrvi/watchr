<template>
  <div class="ErrorComponent">
    <IllustrationError class="illustration-colors"
      name="Error"
      :title="getTitle"
    />  
  </div>
</template>

<script>

import { mapGetters } from 'vuex'

import IllustrationVue from './Illustration.vue'

export default {
  props: ['hideTitle'],
  components: {
    IllustrationError: IllustrationVue,
  },
  computed: {
    ...mapGetters(['l']),
    getTitle() {
      return this.hideTitle ? "" : this.l['Some error occurred, please try again later.']
    },
  },
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
