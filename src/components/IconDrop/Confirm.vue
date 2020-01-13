<template>
  <div class="Confirm" :class="platform">
    <p class="msg">{{ content.msg }}</p>
    <AuthButton v-if="content.callback"
      value='Continue'
      @click="callback"
    />
  </div>
</template>

<script>

import AuthButton from '@/components/Auth/Button.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    AuthButton,
  },
  props: ['content'], 
  methods: {
    callback() {
      if (this.content.callback) {
        this.content.callback()

        this.$emit('close')
      }
    },
  },
  computed: {
    ...mapGetters(['platform'])
  },
}

</script>

<style scoped>

.Confirm {
  margin: 12px;
  width: 400px;
}

.Confirm.mobile {
  width: 250px;
}

.msg {
  margin: 12px;
}

</style>
