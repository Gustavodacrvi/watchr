<template>
  <div class="Info" style="flex-direction: column; align-items: flex-start;margin-top: 4px">
    <div>
      <HeaderInfo
        icon="sleep"
        :info="`${l['Defered to']}:`"
        :content="defer"
        :left="deferDaysLeft"
        @click="$parent.$parent.$emit('remove-defer-date')"
      />
    </div>
    <div>
      <HeaderInfo
        icon="deadline"
        :info='`${l["Deadline"]}:`'
        :content="deadline"
        :left="deadlineDaysLeft"
        @click="$parent.$emit('remove-deadline')"
      />
      <HeaderInfo
        icon='repeat'
        info=''
        :content='repeatCalendar'
        :left='repeatCalendarNextEvent'
        @click="$parent.$emit('remove-repeat')"
      />
    </div>
    <div class="tags">
      <Tag class="tag" v-for="t in headerTags" :key="t"
        :value="t"
        icon="tag"
        @click="$parent.$emit('remove-header-tag', t)"
      />
    </div>
  </div>
</template>

<script>

import HeaderInfo from './../HeaderInfo.vue'

import { mapGetters } from 'vuex'

import mom from 'moment'

import Tag from './../../Tag.vue'

export default {
  components: {
    HeaderInfo, Tag,
  },
  props: ['headerTags', 'headerDates', 'headerCalendar'],
  methods: {
    getDateDifference(date) {
      return mom(date, 'Y-M-D').diff(mom(), 'd') + 1
    },
  },
  computed: {
    ...mapGetters(['l', 'userInfo']),
    defer() {
      const l = this.l
      if (this.headerDates && this.headerDates.defer) {
        return utils.getHumanReadableDate(this.headerDates.defer, this.l)
      }
      return null
    },
    deferDaysLeft() {
      if (this.headerDates && this.headerDates.defer) {
        return `${this.getDateDifference(this.headerDates.defer)} ${this.l['days left']}`
      }
    },
    deadlineDaysLeft() {
      if (this.headerDates && this.headerDates.deadline) {
        return `${this.getDateDifference(this.headerDates.deadline)} ${this.l['days left']}`
      }
    },
    deadline() {
      const l = this.l
      if (this.headerDates && this.headerDates.deadline) {
        return utils.getHumanReadableDate(this.headerDates.deadline, this.l)
        return `${l["Deadline"]}: ${date}, ${this.getDateDifference(this.headerDates.deadline)} ${l['days left']}`
      }
    },
    repeatCalendar() {
      if (!this.headerCalendar) return ''
      return utils.parseCalendarObjectToString(this.headerCalendar, this.l, this.userInfo)
    },
    repeatCalendarNextEvent() {
      return ''
/*       if (!this.headerCalendar) return ''
      const { nextCalEvent } = utils.getCalendarObjectData(this.headerCalendar, mom())
      return utils.getHumanReadableDate(nextCalEvent.format('Y-M-D'), this.l) */
    },
  }
}

</script>
