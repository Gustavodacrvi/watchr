<template>
  <div class="Timeline"

    id='timeline'

    @dragenter="dragenter"
    @dragover='dragover'
    @dragleave='dragleave'
    @drop='drop'

    @mousemove="mousemove"
    @mouseleave="mouseleave"

    @click="click"
    @pointerup.passive='stopPropagationOnSelectedItems'
    @mouseup='stopPropagationOnSelectedItems'
    @touchend.passive='stopPropagationOnSelectedItems'
  >

    <BackLines
      :lineHeight='lineHeight'
      :height='height'
    />

    <Cards :class="{disableEvents: hovering}"
      :date='date'
      :height='height'
    />

    <DivisionLine
      :active='true'
      color='var(--red)'
      v-bind="currentTime"
    />

    <DivisionLine v-if="hovering"
      :active='true'
      v-bind="ghostLine"
    />
    
  </div>
</template>

<script>

import BackLines from './BackLines.vue'
import DivisionLine from './Line.vue'
import Cards from './Cards.vue'

import mom from 'moment'

import mixin from "@/mixins/scheduler.js"

import { mapState } from 'vuex'

export default {
  mixins: [mixin],
  components: {
    DivisionLine,
    BackLines, Cards,
  },
  props: ['date'],
  data() {
    return {
      current: mom().format('HH:mm'),
      height: 3200,
      hovering: false,

      ghostLine: {
        top: 0,
        time: '00:00',
      },
    }
  },
  mounted() {
    this.inverval = setInterval(() => {
      this.current = mom(this.current, 'HH:mm').add(1, 'minute').format('HH:mm')
    }, 60000)
    
    document.addEventListener('drop', this.windowDrop)
  },
  beforeDestroy() {
    clearInterval(this.inverval)
    
    document.removeEventListener('drop', this.windowDrop)
  },
  methods: {
    stopPropagationOnSelectedItems(evt) {
      if (this.selectedItems.length > 0)
        evt.stopPropagation()
    },
    handleDrag(evt) {
      let min = this.round(5, this.convertOffsetToMin(evt.offsetY, this.height))

      if (min >= 0 && min <= 1440) {

        this.ghostLine.top = evt.offsetY + 'px'
        this.ghostLine.time = this.formatMin(min)

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
    currentTime() {
      return {
        top: this.convertMinToOffset(
          this.getFullMin(this.current),
          this.height
        ) + 'px',
        time: this.current,
      }
    },
    lineHeight() {
      return this.height / 24
    },
    timelineData() {
      return this.$el.getBoundingClientRect()
    },
  },
}

</script>

<style scoped>

.Timeline {
  position: relative;
  margin-top: 50px;
  max-height: 100%;
}

.disableEvents {
  pointer-events: none;
}

</style>
