<template>
  <div
    class="Card"

    :style="{top}"
  >
    <div class="card-wrapper" :style="{height}">
      {{ name }}
    </div>
  </div>
</template>

<script>

export default {
  props: ['name', 'time', 'duration', 'id', 'timelineHeight'],
  methods: {
    convertMinToOffset(height, min) {
      /*
        offset * 1440 / height = min

        1440 / height * min = 1 / offset
        height * min / 1440 = offset
      */
      
      return height * min / 1440
    },
    getFullMin(str) {
      const split = str.split(':')
      return (parseInt(split[0], 10) * 60) + parseInt(split[1], 10)
    },
  },
  computed: {
    top() {
      return this.convertMinToOffset(this.timelineHeight, this.getFullTimeMin) + 'px'
    },
    height() {
      return this.convertMinToOffset(this.timelineHeight, this.getFullDurationMin) + 'px'
    },
    getFullDurationMin() {
      return this.getFullMin(this.duration)
    },
    getFullTimeMin() {
      return this.getFullMin(this.time)
    },
  },
}

</script>

<style scoped>


.Card {
  left: 0;
  width: 100%;
  position: absolute;
}

.card-wrapper {
  padding: 12px;
  margin-left: 60px;
  border-radius: 8px;
  background-color: var(--card);
}

</style>
