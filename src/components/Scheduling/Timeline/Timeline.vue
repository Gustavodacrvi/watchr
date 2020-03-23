<template>
  <div class="Timeline"

    id='timeline'

    @dragenter="dragenter"
    @dragover='dragover'
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

      :mainView='mainView'
      @scroll='v => $emit("scroll", v)'
    />

    <DivisionLine v-if='showRedLine'
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

const TOD_STR = mom().format('HH:mm')

import mixin from "@/mixins/scheduler.js"

import { mapState, mapGetters } from 'vuex'

export default {
  mixins: [mixin],
  components: {
    DivisionLine,
    BackLines, Cards,
  },
  props: ['date', 'mainView'],
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
    this.activateRedLine()
    document.addEventListener('drop', this.windowDrop)
  },
  beforeDestroy() {
    this.destroyRedLine()
    
    document.removeEventListener('drop', this.windowDrop)
  },
  methods: {
    activateRedLine() {
      this.destroyRedLine()
      if (this.showRedLine) {
        this.inverval = setInterval(() => {
          this.current = mom(this.current, 'HH:mm').add(1, 'minute').format('HH:mm')
        }, 60000)
      }
    },
    destroyRedLine() {
      if (this.inverval)
        clearInterval(this.inverval)
    },
    
    stopPropagationOnSelectedItems(evt) {
      if (this.selectedItems.length > 0)
        evt.stopPropagation()
    },
    handleDrag(evt) {
      let min = this.round(5, this.convertOffsetToMin(evt.offsetY, this.height))

      if (min >= 0 && min < 1440) {

        this.ghostLine.top = this.convertMinToOffset(min, this.height) + 'px'
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
    ...mapState(['movingTask', 'userInfo', 'selectedItems']),
    ...mapGetters(['height']),
    showRedLine() {
      return this.current === TOD_STR
    },
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
  watch: {
    date() {
      this.activateRedLine()
    },
  },
}

</script>

<style scoped>

.Timeline {
  position: relative;
  max-height: 100%;
  margin-top: 10px;
}

.disableEvents {
  pointer-events: none;
}

</style>
