
import utils from "@/utils"

import mom from 'moment'

import { mapGetters, mapState } from "vuex"

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  methods: {
    parseKeyword(str) {
      const res = utils.calendarObjNaturalCalendarInput(str, this.userInfo.disablePmFormat)
      return res ? res.calendar : null
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
      iconDrop: state => state.iconDrop,
      user: state => state.user,

      viewName: state => state.viewName,
      viewType: state => state.viewType,

      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,
    }),
    ...mapGetters({
      lists: 'list/sortedLists',
      folders: 'folder/sortedFolders',
      groups: 'group/sortedGroupsByName',
      tags: 'tag/sortedTagsByName',
      getSpecificDayCalendarObj: 'task/getSpecificDayCalendarObj',
      getTagsById: 'tag/getTagsById',

      colors: 'colors',

      getListsById: 'list/getListsById',
      getFoldersById: 'folder/getFoldersById',
      getGroupsById: 'group/getGroupsById',
      getAssigneeIconDrop: 'group/getAssigneeIconDrop',

      isRecurringTask: 'task/isRecurringTask',
    }),
    
    getCalendarStrColor() {
      switch (this.getCalendarStrIcon) {
        case 'inbox': return 'var(--primary)'
        case 'archive': return 'var(--brown)'
        case 'layer-group': return 'var(--olive)'
        case 'star': return 'var(--yellow)'
        case 'sun': return 'var(--orange)'
        case 'calendar': return 'var(--green)'
      }
      return 'var(--txt)'
    },
    getCalendarStrIcon() {
      if (!this.model.calendar)
        return 'inbox'
      if (this.isRecurringItem(this.model))
        return 'repeat'
      switch (this.calendarStr) {
        case 'Someday': return 'archive'
        case 'Anytime': return 'layer-group'
        case 'Today': return 'star'
      }
      if (this.calendarStr.includes('Tomorrow'))
        return 'sun'
      return 'calendar'
    },
    getAssigneeIconDropLinks() {
      const iconDropObj = this.getAssignees
      if (iconDropObj)
        return iconDropObj.links.map(el => ({
              ...el,
              callback: model => {
                if (el.name === "Remove assignee")
                  model.assigned = null
                else model.assigned = el.id
              }
            }))
    },
    getAssignees() {
      let group
      const listObj = this.getListObj
      if (!listObj) return null

      if (this.model.group)
        group = this.model.group
      else if (listObj.group)
        group = listObj.group

      if (group)
        return this.getAssigneeIconDrop({group})
    },
    getAssigneTagObj() {
      return {
        id: 'assigned',
        props: {
          name: this.getAssignedName,
          icon: 'user',
          listWidth: '180px',
          trigger: 'enter',
          list: this.getAssigneeIconDropLinks,
        },
      }
    },
    getAssigneSmartIconObj() {
      return {
        id: 'assign',
        props: {
          placeholder: 'Assign to...',
          title: 'Alt + A',
          icon: 'plus',
          listWidth: '180px',
          color: '',
          trigger: 'enter',
          list: this.getAssigneeIconDropLinks,
        },
      }
    },
    getAssignedName() {
      const iconDropObj = this.getAssignees
      if (iconDropObj)
        return iconDropObj.links.find(el => el.id === this.model.assigned).name
    },
    calendarOptions() {
      const arr = this.calendarSmartIconOptions
        .filter(el => el.name !== 'Inbox' && el.name !== 'This evening' && el.name !== 'Anytime')

      arr.unshift({
        id: 'no date',
        name: 'No date',
        icon: 'bloqued',
        callback: model => model.calendar = null,
      })

      return arr
    },
    calendarTagObj() {
      return {
        id: 'smart_icon_calendar',
        props: {
          name: this.calendarStr,
          icon: this.getCalendarStrIcon,
          color: this.getCalendarStrColor,
          trigger: 'enter',
          compose: this.composeCalendarListHelper,
          list: this.calendarOptions,
        },
      }
    },
    calendarSmartIconObj() {
      return {
        id: 'calendar',
        props: {
          placeholder: 'Defer...',
          title: 'Alt + S',
          icon: 'calendar',
          color: 'var(--green)',
          trigger: 'enter',
          compose: this.composeCalendarListHelper,
          list: this.calendarOptions,
        },
      }
    },
    composeCalendarListHelper() {
      return (list, search) => {
        if (!search)
          return list
        
        let arr = list.filter(el => el.name.toLowerCase().includes(search.toLowerCase()), this.userInfo.disablePmFormat)

        const helperList = utils.matchCalendarHelperList(search, false)

        arr = [...arr, ...helperList.map(el => ({
          ...el,
          callback: model => {
            model.calendar = this.parseKeyword(' ' + el.name),
            this.fromIconDrop = true
          },
        }))]

        const calendar = this.parseKeyword(' ' + search.trim())
        if (calendar)
          arr.unshift({
            id: 'found_match',
            name: search,
            icon: 'calendar',
            callback: model => {
              this.fromIconDrop = true
              model.calendar = calendar
            }
          })

        return arr
      }
    },
    getPrioritySmartIconObj() {
      return {
        id: 'priority',
        props: {
          placeholder: 'Priority...',
          title: 'Alt + P',
          icon: 'priority',
          color: 'var(--yellow)',
          listWidth: '150px',
          trigger: 'enter',
          list: [
            {
              id: 'priority',
              name: 'High priority',
              icon: 'priority',
              color: 'var(--red)',
              callback: model => model.priority = 'High priority',
            },
            {
              id: 'priority2',
              name: 'Medium priority',
              icon: 'priority',
              color: 'var(--yellow)',
              callback: model => model.priority = 'Medium priority',
            },
            {
              id: 'priority3',
              name: 'Low priority',
              icon: 'priority',
              color: 'var(--primary)',
              callback: model => model.priority = 'Low priority',
            },
            {
              id: 'priority4',
              name: 'No priority',
              icon: 'priority',
              callback: model => model.priority = '',
            },
          ],
        },
      }
    },
    durationList() {
      return [
        {
          id: 'no_duration_clock',
          name: 'No duration',
          icon: 'bloqued',
          callback: model => model.taskDuration = null,
        },
        {
          id: 'select_date',
          name: 'Select duration',
          icon: 'duration',
          callback: model => {
            this.$store.commit('pushIconDrop', {
              comp: 'DurationPicker',
              content: {
                callback: time => {model.taskDuration = time},
              },
            })
          },
        },
        {
          id: '5min',
          name: '5 minutes',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '00:05',
        },
        {
          id: '10min',
          name: '10 minutes',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '00:10',
        },
        {
          id: '15min',
          name: '15 minutes',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '00:15',
        },
        {
          id: '20min',
          name: '20 minutes',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '00:20',
        },
        {
          id: '30min',
          name: '30 minutes',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '00:30',
        },
        {
          id: '1 hour',
          name: '1 hour',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '01:00',
        },
        {
          id: '2 hour',
          name: '2 hour',
          icon: 'duration',
          color: 'var(--purple)',
          callback: model => model.taskDuration = '02:00',
        },
      ]
    },
    getFilteredListMoveToListOptions() {
      return this.getMoveToListOptions.filter(el => el.name !== 'Move to list')
    },
    getFilteredListSmartIconObj() {
      return {
        id: 'move',
        props: {
          placeholder: 'Move to...',
          title: 'Alt + M',
          icon: 'tasks',
          color: 'var(--primary)',
          trigger: 'enter',
          list: this.getFilteredListMoveToListOptions,
        },
      }
    },
    rightSmartIconDurationObj() {
      return {
        id: 'duration',
        props: {
          placeholder: 'Duration...',
          title: 'Alt + E',
          icon: 'duration',
          color: 'var(--purple)',
          trigger: 'enter',
          compose: this.composeDurationList,
          list: this.durationList,
        },
      }
    },
    composeDurationList() {
      return (list, search) => {
        if (!search)
          return list

        const duration = utils.matchDuration(search)

        const arr = list.filter(el => el.name.toLowerCase().includes(search.toLowerCase()))

        if (duration)
          arr.unshift({
            id: 'hour_obj',
            name: utils.formatQuantity(duration),
            icon: 'duration',
            listWidth: '225px',
            trigger: 'enter',
            callback: model => model.taskDuration = duration
          })

        return arr
      }
    },
    getMoveToListSmartIconObj() {
      return {
        id: 'move',
        props: {
          placeholder: 'Move to...',
          title: 'Alt + M',
          icon: 'tasks',
          color: 'var(--primary)',
          listWidth: '180px',
          trigger: 'enter',
          list: this.getMoveToListOptions,
        },
      }
    },
    getMoveToListOptions() {
      return [
        {
          id: 'fdsa',
          name: 'Move to list',
          icon: 'tasks',
          color: 'var(--primary)',
          callback: () => this.lists.map(el => ({
            id: el.id,
            name: el.name,
            icon: 'tasks',
            callback: model => {
              model.list = el.id
              model.heading = null
              model.folder = null
              model.assigned = null
              model.group = null
            },
          }))
        },
        {
          id: 'fds',
          name: 'Move to folder',
          icon: 'folder',
          callback: () => this.folders.map(el => ({
            id: el.id,
            name: el.name,
            icon: 'folder',
            callback: model => {
              model.list = null
              model.heading = null
              model.folder = el.id
              model.assigned = null
              model.group = null
            },
          }))
        },
        {
          id: 'fs',
          name: 'Move to group',
          icon: 'group',
          callback: () => this.groups.map(el => ({
            id: el.id,
            name: el.name,
            icon: 'group',
            callback: model => {
              model.list = null
              model.heading = null
              model.folder = null
              model.assigned = null
              model.group = el.id || null
            },
          }))
        },
        {
          id: 'fd',
          name: 'Remove from lists',
          icon: 'bloqued',
          callback: model => {
            model.list = null
            model.heading = null
            model.folder = null
            model.group = null
          },
        },
      ]
    },
    calendarStr() {
      if (this.model.calendar)
        return utils.parseCalendarObjectToString(this.model.calendar, this.userInfo, true, false)
      return "Inbox"
    },
    deadlineIconOptions() {
      return [
        {
          id: 'o',
          name: 'No deadline',
          icon: 'bloqued',
          color: 'var(--txt)',
          callback: model => model.deadline = null
        },
        {
          id: 'tod',
          name: 'Today',
          icon: 'star',
          color: 'var(--yellow)',
          callback: model => model.deadline = TOD_STR,
        },
        {
          id: 'to',
          name: 'Tomorrow',
          icon: 'sun',
          color: 'var(--orange)',
          callback: model => model.deadline = TOD.clone().add(1, 'd').format('Y-M-D')
        },
        {
          id: 'select_date',
          name: 'Select date',
          icon: 'calendar',
          color: 'var(--green)',
          callback: model => {
            this.$store.commit('pushIconDrop', {
              comp: 'CalendarPicker',
              content: {
                allowNull: true,
                noTime: true,
                defaultTime: model.deadline,
                onlyDates: true,
                callback: calendar => {
                  model.deadline = calendar.specific
                },
              },
            })
          }
        },
      ]
    },
    deadlineListComposer() {
      return (list, search) => {
        if (!search)
          return list
        
        let arr = list.filter(el => el.name.toLowerCase().includes(search.toLowerCase()), this.userInfo.disablePmFormat)

        const helperList = utils.matchCalendarHelperList(search, true)

        arr = [...arr, ...helperList.map(el => ({
          ...el,
          callback: model => model.deadline = this.parseKeyword(' ' + el.name).specific,
        }))]

        
        const calendar = this.parseKeyword(' ' + search.trim())
        if (calendar && calendar.type === 'specific')
          arr.unshift({
            id: 'found_match',
            name: search,
            icon: 'calendar',
            callback: model => {
              this.fromIconDrop = true
              model.calendar = calendar
            }
          })

        return arr
      }
    },
    isInAtLeastOneList() {
      return this.model.list || this.model.folder || this.model.group
    },
    getListIcon() {
      if (this.model.list)
        return 'tasks'
      if (this.model.group)
        return 'group'
      if (this.model.folder)
        return 'folder'
    },
    getListColor() {
      const obj = this.getListObj
      if (obj && obj.color)
        return obj.color
      if (this.model.list)
        return 'var(--primary)'
    },
    getListHeadingName() {
      const listObj = this.getListObj

      if (this.model.heading && listObj && listObj.headings && listObj.headings.length > 0)
        return listObj.headings.find(el => el.id === this.model.heading).name
    },
    getListObj() {
      if (this.model.list)
        return this.getListsById([this.model.list])[0]
      if (this.model.folder)
        return this.getFoldersById([this.model.folder])[0]
      if (this.model.group)
        return this.getGroupsById([this.model.group])[0]
    },
    deadlineSmartIconObj() {
      return {
        id: 'deadline',
        props: {
          placeholder: 'Deadline...',
          title: 'Alt + D',
          icon: 'deadline',
          color: 'var(--orange)',
          trigger: 'enter',
          compose: this.deadlineListComposer,
          list: this.deadlineIconOptions,
        },
      }
    },
    selectedColorObj() {
      return this.colors.find(el => el.color === this.model.color)
    },
    getColorArr() {
      const getObj = item => ({
        id: item.name,
        name: item.name,
        icon: 'tint',
        color: item.color,
        trigger: 'enter',
        callback: model => model.color = item.color
      })

      return [
        {
          id: 'no_color',
          name: 'No color',
          icon: 'tint',
          trigger: 'enter',
          callback: model => model.color = null,
        },
        ...this.colors.map(getObj),
      ]
    },
    colorRightSmartIconObj() {
      return {
        id: 'color',
        props: {
          placeholder: 'Color name...',
          title: 'Alt + O',
          icon: 'tint',
          color: 'var(--yellow)',
          trigger: 'enter',
          list: this.getColorArr,
        },
      }
    },
    getSmartIconTags() {
      return {
        id: 'tag',
        props: {
          placeholder: 'Tags...',
          title: 'Alt + T',
          icon: 'tag',
          color: 'var(--red)',
          trigger: 'enter',
          list: this.tags.map(el => ({
            id: el.id,
            name: el.name,
            icon: 'tag',
            color: 'var(--red)',
            callback: model => {
              if (!model.tags) {
                model.tags = [el.id]
              } else {
                if (model.tags.includes(el.id)) {
                  const i = model.tags.findIndex(id => el.id)
                  model.tags.splice(i, 1)
                  this.cursorPos--
                } else {
                  this.cursorPos++
                  model.tags.push(el.id)
                }
              }
            },
          })),
        },
      }
    },
    getTagsLabels() {
      return utils.sortListByName(
          this.getTagsById(
            this.model.tags
          )
        ).map(tag => ({
          id: tag.id,
          props: {
            icon: 'tag',
            color: 'var(--red)',
            name: tag.name,
            trigger: 'click',
            callback: model => {
              const i = model.tags.findIndex(el => el === tag.id)
              if (i > -1)
                model.tags.splice(i, 1)
            },
          },
        }))
    },
    deadlineTagObj() {
      return {
        id: 'deadline',
        props: {
          name: utils.getHumanReadableDate(this.model.deadline),
          icon: 'deadline',
          color: 'var(--orange)',
          trigger: 'enter',
          compose: this.deadlineListComposer,
          list: this.deadlineIconOptions,
        },
      }
    },

    calendarSmartIconOptions() {
      return [
        {
          id: 'tod',
          name: 'Today',
          icon: 'star',
          color: 'var(--yellow)',
          callback: model => {
            this.fromIconDrop = true
            model.calendar = this.getSpecificDayCalendarObj(TOD_STR)
          },
        },
        {
          id: 'eve',
          name: 'This evening',
          icon: 'moon',
          color: 'var(--dark-purple)',
          callback: model => {
              this.fromIconDrop = true
              model.calendar = {
              ...this.getSpecificDayCalendarObj(TOD_S0TR),
              evening: true,
            }
          },
        },
        {
          id: 'tom',
          name: 'Tomorrow',
          icon: 'sun',
          color: 'var(--orange)',
          callback: model => {
            this.fromIconDrop = true
            model.calendar = this.getSpecificDayCalendarObj(TOD.clone().add(1, 'd').format('Y-M-D'))
          },
        },
        {
          id: 'soa',
          name: 'Anytime',
          icon: 'layer-group',
          color: 'var(--olive)',
          callback: model => {
            this.fromIconDrop = true
            model.calendar = {
              type: 'anytime',

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          }
        },
        {
          id: 'sa',
          name: 'Someday',
          icon: 'archive',
          color: 'var(--brown)',
          callback: model => {
            this.fromIconDrop = true
            model.calendar = {
              type: 'someday',

              editDate: TOD_STR,
              begins: TOD_STR,
            }
          }
        },
        {
          id: 's',
          name: 'Inbox',
          icon: 'inbox',
          color: 'var(--primary)',
          callback: model => {
            this.fromIconDrop = true
            model.calendar = null
          }
        },
        {
          id: 'select_date',
          name: 'Select date',
          icon: 'calendar',
          color: 'var(--green)',
          callback: model => {
            this.$store.commit('pushIconDrop', {
              comp: 'CalendarPicker',
              content: {
                repeat: true,
                callback: calendar => {
                  this.fromIconDrop = true
                  model.calendar = calendar
                },
              },
            })
          }
        },
      ]
    },
  },
}
