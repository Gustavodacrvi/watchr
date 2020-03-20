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
      hovering: false,

      ghostLine: {
        top: 0,
        time: '00:00',
        nonFormatedTime: '00:00',
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

      if (min >= 0 && min < 1440) {

        this.ghostLine.top = evt.offsetY + 'px'
        this.ghostLine.nonFormatedTime = this.formatMin(min, false)
        this.ghostLine.time = this.formatMin(min)

      }
    },
    click(evt) {
      if (this.selectedItems.length > 0) {
        evt.stopPropagation()
      }

      this.saveSelectedTime()
      
      if (this.hovering)
        this.hovering = false
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
    saveSelectedTime(ids) {
      this.$store.dispatch('task/saveTaskTimelineByIds', {
        time: this.ghostLine.nonFormatedTime, ids: ids || this.selectedItems.slice(), date: this.date,
      })
      this.$store.commit('clearSelected')
    },
    drop(evt) {
      const res = evt.dataTransfer.getData('text/plain')
      if (!res) return;
      const obj = JSON.parse(evt.dataTransfer.getData('text/plain'))
      if (!obj) return;
      if (!obj.ids || !Array.isArray(obj.ids) || !obj.viewName || !obj.viewType) return;

      this.saveSelectedTime(obj.ids)
    },
    windowDrop() {
      this.hovering = false
    },
  },
  computed: {
    ...mapState(['movingTask', 'userInfo', 'selectedItems', 'height']),
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
