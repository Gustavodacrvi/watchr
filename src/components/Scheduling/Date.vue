<template>
  <div
    class="Date"
    :class="{dragover}"

    @dragover='dragover = true'
    @dragleave='dragover = false'
    @drop='dragover = false'
    @mouseleave="dragover = false"

    :data-date='getDate'

    @click.stop="save"
    @pointerup.stop
    @mouseup.stop
    @touchend.stop.passive
  >
    <div
      class="day-wrapper"
    >
      <span>
        {{ date }}
      </span>
      <span class="centralize"
        v-if="allowTaskAdd"
      >
        <Point v-bind='$props'/>
      </span>
    </div>
  </div>  
</template>

<script>

import Point from "./Point.vue"

import { mapState } from 'vuex'

export default {
  props: ['date', 'year', 'month', 'allowTaskAdd'],
  components: {
    Point,
  },
  data() {
    return {
      dragover: false,
    }
  },
  methods: {
    save() {
      if (this.selectedItems.length === 0)
        this.$emit('select', this.getDate)
      else this.$emit('save', this.getDate)
    },
  },
  computed: {
    ...mapState(['selectedItems']),
    getDate() {
      return `${this.year}-${this.month}-${this.date}`
    },
  },
}

</script>

<style scoped>

.day-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.centralize {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
