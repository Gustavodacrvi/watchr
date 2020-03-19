<template>
  <div class="Timeline"

    @dragenter="dragenter"
    @dragover='dragover'
    @pointerleave='pointerleave'
  >
    <BackLines
      :lineHeight='lineHeight'
      :height='height'
    />
  </div>
</template>

<script>

import BackLines from './BackLines.vue'

import { mapState } from 'vuex'

export default {
  components: {
    BackLines,
  },
  props: ['date'], 
  data() {
    return {
      height: 1700,
    }
  },
  methods: {
    dragenter(evt) {
      if (this.movingTask)
        evt.preventDefault()
    },
    dragover(evt) {
      if (this.movingTask) {
        console.log(evt)
      }
    },
    pointerleave() {

    },
  },
  computed: {
    ...mapState(['movingTask']),
    lineHeight() {
      return this.height / 24
    },
  },
}

</script>

<style scoped>

.Timeline {
  max-height: 100%;
  overflow: auto;
}

</style>
