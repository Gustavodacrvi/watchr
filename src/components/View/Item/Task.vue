<template>
  <ItemTemplate
    v-bind="{...$attrs, ...$props}"
    class="Task"
    editComponent='Task'

    ref='template'

    :item='item'
    :completedItem='completedItem'
    :showInfo='hasAtLeastOne'
    :canceledItem='canceledItem'
    :options='options'
    editRawPlaceholder='Task name...'

    @copy-item='copyItem'

    @assign-user='assignUser'

    @complete-item='completeItem'
    @uncomplete-item='unCompleteItem'

    @cancel-item='cancelItem'
    @save='save'
    @uncancel-item='unCancelItem'
  >
    <template v-slot:check-icon="props">
      <CheckIcon
        v-bind="{...{...$attrs, ...$props}, ...item}"

        :isItemSelected='isItemSelected'
        :completed='props.completed'
        :itemModel='props.itemModel'
        :canceled='props.canceled'
        :color='props.color'
        :forceDefault='props.forceDefault'
      />
    </template>

    <template v-slot:root>
      <TimelineElement v-if='computedShowRuler'
        :startHour='startHour'
        :startMin='startMin'
        :timePmAm='timePmAm'
      
        @click.native='rulerClick'
      />
    </template>

    <template v-slot:before-name>
      <span v-if="logStr && !showCheckDate"
        key='check-date'
        class="check-date"
      >
        {{ logStr }}
      </span>
      <Icon v-else-if="nameIcon"
        class="name-icon"
        key='name-icon'
      
        :icon='nameIcon.name'
        :color='nameIcon.color'

        width='14px'
      />
      <span v-else-if="calendarStr"
        key='info-box'
        class="info-box"
      >
        {{ calendarStr }}
      </span>
      <span v-if="nextCalendarEvent && !isDesktopBreakPoint"
        key='next-box'
        class="info-box"
      >
        {{ nextCalendarEvent }}
      </span>
      <span v-if="timeStr"
        key='info-time'
        class="info-box"
      >
        {{ timeStr }}
      </span>
    </template>

    <template v-slot:after-name>
      <span v-if="taskDuration"
        key='duration'
        class="info-box"
      >
        {{ taskDuration }}
      </span>
      <Icon v-if="checklistProgress" key="icon"
        class="icon name-icon"
        icon='pie'
        :progress='checklistProgress'
        width='7px'
        data-isfirstcontelement='first'
      />
      <span v-if="hasFiles"
        key="file"
        class="info-box"
      >
        <Icon
          icon='file'
          :color='hasFiles'
          width='8px'
        />
      </span>
    </template>

    <template v-slot:flex-end>
      <span v-if="deadlineStr"
        key='deadline'
        class="info-naked"
        style='color: var(--red)'
      >
        <span class="info-icon">
          <Icon
            icon='deadline'
            width='11px'
          />
        </span>
        <span>
          {{ deadlineStr }}
        </span>
      </span>
      <span v-if="nextCalendarEvent && isDesktopBreakPoint"
        key='next-box'
        class="info-box"
      >
        {{ nextCalendarEvent }}
      </span>
    </template>

    <template v-slot:info>
      <Info v-show="hasAtLeastOne"
        :isToday='isToday'
        :isTomorrow='isTomorrow'
        :evening='item && item.calendar && item.evening'

        :listObj='listObj'
        :folderObj='folderObj'
        :groupObj='groupObj'
        
        :hasTags='hasTags'
        :tagNames='tagNames'
      />
    </template>
  </ItemTemplate>
</template>

<script>

import CheckIcon from "./Components/CheckIcons/Task.vue"
import ItemTemplate from "./Components/ItemTemplate.vue"
import Info from "./Components/Info/Task.vue"
import TimelineElement from "./Components/TimelineElement.vue"

import utils from "@/utils"
import utilsTask from "@/utils/task"
import utilsMoment from "@/utils/moment"

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

const tod = mom()
const TOD_DATE = tod.format('Y-M-D')

export default {
  props: [
    'item', 'movingItem', 'disableCalendarStr',
    'disableDeadlineStr', 'timelineIncrement', 'hideListName',
    'hideGroupName', 'hideFolderName', 'showingRuler',
    'isSelecting', 'allowDeadlineStr', 'allowLogStr', 'itemModelFallback',
    'isAdding', 'listRenderer',

    'viewName', 'viewType',
  ],
  components: {
    ItemTemplate, Info,
    CheckIcon, TimelineElement,
  },
  methods: {
    save(obj) {
      if (this.item)
        this.saveTaskContent(obj)
      else this.$emit('save', obj)
    },
    copyItem() {
      if (this.item)
        this.$store.dispatch('task/copyTask', this.item)
    },
    assignUser(uid) {
      this.saveTaskContent({
        assigned: uid,
      })
    },
    rulerClick() {
      if (!this.isSelecting)
        this.selectItem()
    },
    toggleCompletion() {
      this.$refs.template.toggleCompletion()
    },
    selectItem() {
      this.$refs.template.selectItem()
    },
    saveTaskContent(obj) {
      this.$store.dispatch('task/saveTask', {
        id: this.item.id,
        ...obj,
      })
    },
    saveNewCalendarTime() {
      if (this.incrementedTime)
        this.saveTaskContent({
          calendar: {
            ...this.item.calendar,
            time: this.incrementedTime,
          },
        })
    },

    cancelItem() {
      this.$store.dispatch('task/cancelTasks', [this.item.id])
    },
    unCancelItem() {
      this.$store.dispatch('task/uncancelTasks', [this.item.id])
    },
    completeItem() {
      this.$store.dispatch('task/completeTasks', [this.item])
    },
    unCompleteItem() {
      this.$store.dispatch('task/uncompleteTasks', [this.item])
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      selectedItems: state => state.selectedItems,
    }),
    ...mapGetters({
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      calendarDate: 'calendarDate',
      getTagsById: 'tag/getTagsById',
      getListsById: 'list/getListsById',
      getFoldersById: 'folder/getFoldersById',
      savedFolders: 'folder/savedFolders',
      getGroupsById: 'group/getGroupsById',
      isTaskInView: 'task/isTaskInView',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskCanceled: 'task/isTaskCanceled',
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
      if (!this.item)
        return;
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
      if (!this.item)
        return false
      return this.isRecurringTask(this.item)
    },
    deadlineStr() {
      if (this.allowDeadlineStr && this.disableDeadlineStr || !this.item)
        return null
      return this.getTaskDeadlineStr(this.item, TOD_DATE)
    },

    logStr() {
      if (!this.allowLogStr || !this.item.logDate) return null
      return utils.getHumanReadableDate(this.item.logDate)
    },
    showCheckDate() {
      const n = this.viewName
      if ((!this.item.checkDate && !this.item.completeDate) || n === 'Logbook' || n === 'Logbook' || n === 'Canceled')
        return null
      return utils.getHumanReadableDate(this.item.checkDate || this.item.completeDate)
    },
    calendarTime() {
      const c = this.item.calendar
      if (!c || !c.time) return null
      if (this.incrementedTime)
        return this.incrementedTime
      return c.time
    },
    timeStr() {
      if (!this.item || !this.calendarTime || this.computedShowRuler)
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

    computedShowRuler() {
      return this.showingRuler && this.calendarDate
    },

    nextCalendarEvent() {
      if (!this.item)
        return;
      const t = this.item
      const c = t.calendar
      
      if (!c || !this.isRepeatingTask)
        return null

      const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c, true)

      const date = utils.getHumanReadableDate(nextEventAfterCompletion.format('Y-M-D'))
      if (!date || date === this.viewName) return null
      return date
    },
    folderObj() {
      if (!this.item)
        return;
      const folder = this.itemFolder

      if (!folder || this.hideFolderName || (folder.name === this.viewName)) return null
      
      return {
        name: folder.name,
        color: folder.color,
      }
    },
    itemGroup() {
      if (!this.item || !this.item.group)
        return null
      return this.getGroupsById([this.item.group])[0]
    },
    groupObj() {
      if (!this.item)
        return;
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
      if (!this.item)
        return;
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
    formatedTime() {
      if (!this.calendarTime)
        return null
      return mom(this.calendarTime, 'HH:mm').format(this.timeFormat)
    },
    timeFormat() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    },
    timePmAm() {
      if (!this.formatedTime || this.userInfo.disablePmFormat)
        return null
      const split = this.formatedTime.split(' ')
      return split[split.length - 1]
    },
    startMin() {
      if (!this.calendarTime)
        return null
      return mom(this.calendarTime, 'HH:mm').format('mm')
    },
    timeNumbers() {
      if (!this.formatedTime)
        return null
      if (this.userInfo.disablePmFormat)
        return this.formatedTime
      return this.formatedTime.split(' ')[0]
    },
    startHour() {
      if (!this.formatedTime)
        return null

      return mom(this.timeNumbers, 'HH:mm').format('HH')
    },
    completedItem() {
      if (this.item)
        return this.isTaskCompleted(this.item, TOD_DATE, this.itemCompletionCompareDate)
    },
    canceledItem() {
      if (this.item)
        return this.isTaskCanceled(this.item)
    },

    hasAtLeastOne() {
      if (!this.item)
        return false
      return (this.listObj ||
        this.folderObj ||
        this.groupObj ||
        (this.hasTags && this.tagNames && this.tagNames.length > 0))
    },
    options() {
      if (this.item)
        return utilsTask.taskOptions(this.item, this)
    },

    taskDuration() {
      const duration = this.item.taskDuration
      if (this.item && duration) {
        
        if (!this.computedShowRuler)
          return utils.formatQuantity(duration)
        else {
          const begin = utils.formatQuantity(duration)
          if (!this.calendarTime)
            return begin

          const split = duration.split(':')
          const end = utils.parseTime(mom(this.calendarTime, 'HH:mm')
            .add(parseInt(split[0], 10), 'h')
            .add(parseInt(split[1], 10), 'm').format('HH:mm'), this.userInfo)
          
          return `${begin} -> ${end}`
        }
      }
    },
    checklistPieProgress() {
      if (!this.item)
        return;
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
      if (!this.item)
        return;
      if (this.item.checklist && this.item.checklist.length > 0)
        return this.checklistPieProgress
    },

    hasFiles() {
      return this.item && this.item.files && this.item.files.length > 0
    },
    hasTags() {
      if (!this.item)
        return false
      if (this.viewType === 'tag' && this.tagNames.length === 1)
        return this.tagNames[0] !== this.viewName
      return this.item.tags && this.item.tags.length > 0
    },
    tagNames() {
      if (!this.item)
        return;
      return this.getTagsById(this.item.tags || []).map(el => el.name)
    },

    isItemSelected() {
      if (!this.item)
        return;
      return !this.movingItem && this.selectedItems.includes(this.item.id)
    },

    isCalendarView() {
      if (this.viewType === 'calendar')
        return true
      const n = this.viewName
      return n === 'Today' || n === 'Tomorrow'
    },
    isInbox() {
      if (!this.item || this.viewName === 'Inbox')
        return false
      return !this.item.calendar
    },
    isToday() {
      if (!this.item)
        return false
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
      if (!this.item)
        return false
      return this.isTaskInView(this.item, 'Overdue')
    },
    isTomorrow() {
      if (!this.item)
        return false
      if (this.isCalendarView) return false
      return this.isTaskInView(this.item, 'Tomorrow')
    },
  },
}

</script>

<style scoped src="@/assets/css/itemTemplate.css"></style>
