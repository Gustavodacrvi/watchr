<template>
  <div class="WeeklyPicker">
    <div class="days">
      <span v-for="d of getDays" :key="d"
        class="option cursor"
        :class="{active: isActive(d)}"
        @click="toggle(d)"
      >{{ d }}</span>
    </div>
    <ButtonApp :value="l['Save']" @click="save"/>
  </div>
</template>

<script>

import mom from 'moment'
import Button from '@/components/Auth/Button.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['content'],
  components: {
    ButtonApp: Button,
  },
  data() {
    return {
      weeks: [],
    }
  },
  methods: {
    save() {
      if (this.weeks.length > 0) {
        this.content.callback({
          type: 'weekly',
          weekly: this.weeks,
          editDate: mom().format('Y-M-D'),
        })
        this.$emit('close')
      }
    },
    toggle(d) {
      if (this.isActive(d)) {
        const i = this.weeks.findIndex(e => e === d)
        this.weeks.splice(i, 1)
      }
      else this.weeks.push(d)
    },
    isActive(d) {
      return this.weeks.includes(d)
    },
  },
  computed: {
    ...mapGetters(['l', 'platform']),
    getDays() {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
}

</script>

<style scoped>

.WeeklyPicker {
  width: 350px;
  margin: 0 20px;
}

.days {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.option {
  display: block;
  border-radius: 500px;
  background-color: var(--dark);
  padding: 8px;
  transition-duration: .15s;
}

.option:hover {
  background-color: var(--light-gray);
}

.option:active {
  transform: scale(.9, .9);
}

.active {
  background-color: var(--primary);
  color: white;
}

</style>
