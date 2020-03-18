<template>
  <div
    class="Date"
    :class="{dragover}"

    @dragover='dragover = true'
    @dragleave='dragover = false'
    @drop='dragover = false'
    @mouseleave="dragover = false"

    :data-date='`${year}-${month}-${date}`'
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

export default {
  props: ['date', 'year', 'month', 'allowTaskAdd'],
  data() {
    return {
      dragover: false,
    }
  },
  components: {
    Point,
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
