<template>
  <div class="Timeline"

    @dragenter="dragenter"
    @dragover='dragover'
    @dragleave='dragleave'
    @drop='drop'
  >

    <BackLines
      :lineHeight='lineHeight'
      :height='height'

      :hovering='hovering'
      :ghostLine='ghostLine'
    />
    
  </div>
</template>

<script>

import BackLines from './BackLines.vue'

import mom from 'moment'

import { mapState } from 'vuex'

export default {
  components: {
    BackLines,
  },
  props: ['date'],
  data() {
    return {
      height: 1700,
      hovering: false,

      ghostLine: {
        top: 0,
        time: '00:00',
      },
    }
  },
  mounted() {
    document.addEventListener('drop', this.windowDrop)
  },
  beforeDestroy() {
    document.removeEventListener('drop', this.windowDrop)
  },
  methods: {
    dragenter(evt) {
      if (this.movingTask)
        evt.preventDefault()
    },
    convertOffsetToMin(offset) {
      return offset * 1440 / this.height
    },
    dragover(evt) {
      this.hovering = true
      if (this.movingTask) {
        const min = this.convertOffsetToMin(evt.offsetY)

        if (min >= 0 && min <= 1440 && (Math.trunc(min) % 5 === 0)) {

          this.ghostLine.top = evt.offsetY + 'px'
          this.ghostLine.time = mom(`${Math.floor(min / 60)}-${Math.floor(min % 60)}`, 'HH:mm').format(this.format)


        }
      }
    },
    dragleave(evt) {
      
    },
    drop() {

    },
    windowDrop() {
      this.hovering = false
    },
  },
  computed: {
    ...mapState(['movingTask', 'userInfo']),
    lineHeight() {
      return this.height / 24
    },
    timelineData() {
      return this.$el.getBoundingClientRect()
    },
    format() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    }
  },
}

</script>

<style scoped>

.Timeline {
  margin-top: 50px;
  max-height: 100%;
}

</style>
