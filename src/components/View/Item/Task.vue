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

        :calendarStr='`Every 2 days`'
        :isRepeatingTask='isRepeatingTask'
        :deadlineStr='"35min"'
        :timeStr='`10:25`'
        :hasFiles='hasFiles'

        :listObj='listObj'
        :folderObj='folderObj'
        :groupObj='groupObj'
        
        :hasTags='true'
        :tagNames='tagNames'
        :taskDuration='`15min`'
      />
    </template>
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/Task.vue"
import ItemTemplate from "./Components/ItemTemplate.vue"
import Info from "./Components/Info/Task.vue"

import utils from "@/utils"
import utilsMoment from "@/utils/moment"

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

const tod = mom()

export default {
  props: [
    'item', 'isSelecting', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'timelineIncrement', 'hideListName',
    'hideGroupName', 'hideFolderName',

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
      getTagsById: 'tag/getTagsById',
      getFoldersById: 'list/getFoldersById',
      savedFolders: 'folder/savedFolders',
      getGroupsById: 'group/getGroupsById',
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

    folderObj() {
      const folder = this.itemFolder

      if (!folder || this.hideFolderName || (folder.name === this.viewName)) return null
      
      return {
        name: folder.name,
        color: folder.color,
      }
    },
    itemGroup() {
      if (!this.item.group)
        return null
      return this.getGroupsById([this.item.group])[0]
    },
    groupObj() {
      const group = this.itemGroup

      if (!group || this.hideGroupName || (group.name === this.viewName)) return null
      
      return {
        name: group.name,
        color: group.color,
      }
    },
    itemFolder() {
      if (!this.item.folder)
        return null
      return this.getFoldersById([this.item.folder])[0]
    },
    listObj() {
      const list = this.itemList
      if (!list || this.hideListName) return null
      const savedList = this.itemList
      if (!savedList || (savedList.name === this.viewName)) return null
      
      let name = savedList.name
      let color = savedList.color
      
      const heading = this.listHeading

      if (heading) {
        name += ' - ' + heading.name
        if (heading.color)
          color = heading.color
      }

      return {name, color}
    },
    listHeading() {
      const list = this.itemList
      if (!list) return null
      return list.headings.find(h => h.id === this.item.heading)
    },
    itemList() {
      if (!this.item.list)
        return null
      return this.getListsById([this.item.list])[0]
    },

    taskDuration() {
      return this.item.taskDuration ? utils.formatQuantity(this.item.taskDuration) : null
    },
    checklistPieProgress() {
      const c = this.item.calendar
      let completed
      
      if (!c || !this.isRepeatingTask)
        completed = this.item.checklist.reduce((acc, opt) => opt.completed ? acc + 1 : acc, 0)
      else {
        const compareDate = utilsMoment.getNextEventAfterCompletionDate(c).format('Y-M-D')
        
        completed = this.item.checklist.reduce((acc, opt) => {
          if (!compareDate)
            return opt.completed ? acc + 1 : acc
          if (!opt.completeDate)
            return false

          return (opt.completed && mom(opt.completeDate, 'Y-M-D').isSameOrAfter(mom(compareDate, 'Y-M-D'), 'day')) ? acc + 1 : acc
        }, 0)
      }

      return 100 * completed / this.item.checklist.length
    },
    checklistProgress() {
      if (this.item.checklist && this.item.checklist.length > 0)
        return this.checklistPieProgress
    },

    hasFiles() {
      return this.item.files && this.item.files.length > 0
    },
    hasTags() {
      if (this.viewType === 'tag' && this.tagNames.length === 1)
        return this.tagNames[0] !== this.viewName
      return this.item.tags && this.item.tags.length > 0
    },
    tagNames() {
      return ['AA', "BB", "Cc"]
      return this.getTagsById(this.item.tags || []).map(el => el.name)
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
