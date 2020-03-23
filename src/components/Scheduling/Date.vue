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
        <Point
          :date='getDate'
          :active='calendarDate === getDate'
        />
      </span>
    </div>
  </div>  
</template>

<script>

import Point from "./Point.vue"

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['date', 'year', 'month', 'allowTaskAdd', 'actionType'],
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
      switch (this.actionType) {
        case 'select': {
          this.$emit('select', this.getDate)
          break
        }
        case 'save': {
          this.$emit('save', this.getDate)
          break
        }
        case 'navigate': {
          this.$router.push(`/user?calendar=${this.getDate}`)
          break
        }
      }
    },
  },
  computed: {
    ...mapState(['selectedItems']),
    ...mapGetters(['calendarDate']),
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

.activeView {
  background-color: var(--purple);
  color: white;
  user-select: none;
}

</style>
