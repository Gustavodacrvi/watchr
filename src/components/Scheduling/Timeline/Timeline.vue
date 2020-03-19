<template>
  <div class="Timeline"

    @dragenter="dragenter"
    @dragover='dragover'
    @dragleave='dragleave'
    @drop='drop'

    @mousemove="mousemove"
    @mouseleave="mouseleave"

    @click="click"
    @pointerup.stop
    @mouseup.stop
    @touchend.stop.passive
  >

    <BackLines
      :lineHeight='lineHeight'
      :height='height'

      :hovering='hovering'
      :ghostLine='ghostLine'
    />

    <Cards
      :date='date'
      :height='height'
    />
    
  </div>
</template>

<script>

import BackLines from './BackLines.vue'
import Cards from './Cards.vue'

import mom from 'moment'

import { mapState } from 'vuex'

export default {
  components: {
    BackLines, Cards,
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
    handleDrag(evt) {
      const min = this.convertOffsetToMin(evt.offsetY)

      if (min >= 0 && min <= 1440 && (Math.trunc(min) % 5 === 0)) {

        this.ghostLine.top = evt.offsetY + 'px'
        this.ghostLine.time = mom(`${Math.floor(min / 60)}-${Math.floor(min % 60)}`, 'HH:mm').format(this.format)

      }
    },
    click(evt) {
      if (this.selectedItems.length > 0) {
        evt.stopPropagation()
      }
      if (this.hovering)
        this.hovering = false
      this.$store.commit('clearSelected')
    },
    
    dragenter(evt) {
      if (this.movingTask)
        evt.preventDefault()
    },
    convertOffsetToMin(offset) {
      return offset * 1440 / this.height
    },
    mousemove(evt) {
      if (this.selectedItems.length > 0) {
        this.hovering = true
        this.handleDrag(evt)
      }
    },
    dragover(evt) {
      this.hovering = true
      if (this.movingTask) {
        this.handleDrag(evt)
      }
    },
    dragleave(evt) {
      
    },
    mouseleave() {
      if (!this.movingTask)
        this.hovering = false
    },
    drop() {

    },
    windowDrop() {
      this.hovering = false
    },
  },
  computed: {
    ...mapState(['movingTask', 'userInfo', 'selectedItems']),
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
  position: relative;
  margin-top: 50px;
  max-height: 100%;
}

</style>
