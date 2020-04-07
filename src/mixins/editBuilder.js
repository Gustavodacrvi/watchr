
import utils from "@/utils"

import mom from 'moment'

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
    composeCalendarListHelper() {
      return (list, search) => {
        if (!search)
          return list
        
        let arr = list.filter(el => el.name.toLowerCase().includes(search.toLowerCase()), this.userInfo.disablePmFormat)

        const helperList = utils.matchCalendarHelperList(search, false)

        arr = [...arr, ...helperList.map(el => ({
          ...el,
          callback: () => {
            this.model.calendar = this.parseKeyword(' ' + el.name),
            this.fromIconDrop = true
          },
        }))]

        const calendar = this.parseKeyword(' ' + search.trim())
        if (calendar)
          arr.unshift({
            id: 'found_match',
            name: search,
            icon: 'calendar',
            callback: () => {
              this.fromIconDrop = true
              this.model.calendar = calendar
            }
          })

        return arr
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
            callback: () => {
              this.model.list = el.id
              this.model.heading = null
              this.model.folder = null
              this.model.assigned = null
              this.model.group = null
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
            callback: () => {
              this.model.list = null
              this.model.heading = null
              this.model.folder = el.id
              this.model.assigned = null
              this.model.group = null
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
            callback: () => {
              this.model.list = null
              this.model.heading = null
              this.model.folder = null
              this.model.assigned = null
              this.model.group = el.id || null
            },
          }))
        },
        {
          id: 'fd',
          name: 'Remove from lists',
          icon: 'bloqued',
          callback: () => {
            this.model.list = null
            this.model.heading = null
            this.model.folder = null
            this.model.group = null
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
          callback: () => {
            this.$store.commit('pushIconDrop', {
              comp: 'CalendarPicker',
              content: {
                allowNull: true,
                noTime: true,
                defaultTime: this.model.deadline,
                onlyDates: true,
                callback: calendar => {
                  this.model.deadline = calendar.specific
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
          callback: () => this.model.deadline = this.parseKeyword(' ' + el.name).specific,
        }))]

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
          icon: 'deadline',
          color: 'var(--orange)',
          trigger: 'enter',
          compose: this.deadlineListComposer,
          list: this.deadlineIconOptions,
        },
      }
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
              this.model.calendar = {
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
          callback: () => {
            this.$store.commit('pushIconDrop', {
              comp: 'CalendarPicker',
              content: {
                repeat: true,
                callback: calendar => {
                  this.fromIconDrop = true
                  this.model.calendar = calendar
                },
              },
            })
          }
        },
      ]
    },
  },
}
