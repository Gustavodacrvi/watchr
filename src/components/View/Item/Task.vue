<template>
  <ItemTemplate
    v-bind="$attrs"
    class="Task"

    :item='item'
    :nameIcon='nameIcon'
  >
    <template v-slot:check-icon>
      <CheckIcon
        v-bind="{...$attrs, item: item}"

        :completed='completed'
        :canceled='canceled'
      />
    </template>

    <template v-slot:info>
      <Info
        :isToday='isToday'
        :isTomorrow='isTomorrow'

        :calendarStr='calendarStr'
        :isRepeatingTask='isRepeatingTask'
        :deadlineStr='deadlineStr'
        :timeStr='timeStr'
        :haveFiles='haveFiles'
        :hasTags='hasTags'
      />
    </template>
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/Task.vue"
import ItemTemplate from "./Components/ItemTemplate.vue"
import Info from "./Components/Info/Task.vue"

import utils from "@/utils"

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

const tod = mom()

export default {
  props: [
    'item', 'isSelecting', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'timelineIncrement',

    'viewName', 'viewType',
  ],
  components: {
    ItemTemplate, Info,
    CheckIcon,
  },
  data() {
    return {
      completed: false,
      canceled: false,
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      isTaskInView: 'task/isTaskInView',
      isRecurringTask: 'task/isRecurringTask',
      getTaskDeadlineStr: 'task/getTaskDeadlineStr',
    }),
    
    nameIcon() {
      if (this.nameIconName && this.nameIconColor)
        return {
          name: this.nameIconName,
          color: this.nameIconColor,
        }
    },
    nameIconName() {
      if (this.isInbox)
        return 'inbox'
      if (this.isToday && !this.isEvening)
        return 'star'
      if (this.isToday && this.isEvening)
        return 'moon'
      if (this.isTomorrow && !this.disableCalendarStr)
        return 'sun'
      if (this.isTaskOverdue)
        return 'star'
    },
    nameIconColor() {
      if (this.isInbox)
        return 'var(--primary)'
      if (this.isToday && !this.isEvening)
        return 'var(--yellow)'
      if (this.isToday && this.isEvening)
        return 'var(--dark-purple)'
      if (this.isTomorrow && !this.disableCalendarStr)
        return 'var(--orange)'
      if (this.isTaskOverdue)
        return 'var(--red)'
    },

    calendarStr() {
      const t = this.item
      const c = this.item.calendar

      if ((!c || c.type === 'someday' || c.type === 'anytime') || this.disableCalendarStr) return null

      if (this.isRepeatingTask && !this.isDesktopBreakPoint)
        return null

      const str = utils.parseCalendarObjectToString(c, this.userInfo, false, false)

      if ((c.type === 'specific' && this.viewType === 'calendar') || str === this.viewName || (str === 'Today')) return null

      return str
    },
    isRepeatingTask() {
      return this.isRecurringTask(this.item)
    },
    deadlineStr() {
      if (this.disableDeadlineStr)
        return null
      return this.getTaskDeadlineStr(this.item, tod.format('Y-M-D'))
    },

    calendarTime() {
      const c = this.item.calendar
      if (!c || !c.time) return null
      if (this.incrementedTime)
        return this.incrementedTime
      return c.time
    },
    timeStr() {
      if (!this.calendarTime)
        return null
      return `at ${utils.parseTime(this.calendarTime, this.userInfo)}`
    },
    incrementedTime() {
      if (!this.timelineIncrement || !this.isItemSelected)
        return null
      const newTime = mom(this.item.calendar.time, 'HH:mm').add(this.timelineIncrement, 'm')
      if (newTime.isValid())
        return newTime.format('HH:mm')
    },

    haveFiles() {
      return this.item.files && this.item.files.length > 0
    },
    hasTags() {
      if (this.viewType === 'tag' && this.tagNames.length === 1)
        return this.tagNames[0] !== this.viewName
      return this.item.tags && this.item.tags.length > 0
    },

    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.item.id)
    },

    isCalendarView() {
      if (this.viewType === 'calendar')
        return true
      const n = this.viewName
      return n === 'Today' || n === 'Tomorrow'
    },
    isInbox() {
      if (this.viewName === 'Inbox')
        return false
      return !this.item.calendar
    },
    isToday() {
      if (this.isCalendarView) return false
      return this.isTaskInView(this.item, 'Today')
    },
    isEvening() {
      const c = this.item.calendar
      if (!c || !c.evening || this.isCalendarView)
        return false
      return true
    },
    isTaskOverdue() {
      return this.isTaskInView(this.item, 'Overdue')
    },
    isTomorrow() {
      if (this.isCalendarView) return false
      return this.isTaskInView(this.item, 'Tomorrow')
    },
  },
}

</script>

<style scoped>

</style>
