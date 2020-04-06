
<script>

import EditBuilder from './EditBuilder.js'

import mom from 'moment'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

import utils from "@/utils/"
import taskUtils from "@/utils/task"

const getMoveToListOptions = function() {
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
          this.$nextTick(() => {
            if (el.group)
              this.cursorPos++
          })
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
          this.$nextTick(() => {
            this.cursorPos++
          })
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
}

export default EditBuilder({
  value: (v, vm) => vm.model.name = v,
  textFields: [
    {
      props: {
        placeholder: 'Notes...',
        enterOnShift: true,
        onPaste(txt) {
          const splitStrs = [' • ',' * ',' - ', ' [ ] ']

          let toSplit = null

          for (const split of splitStrs) {
            if (txt.split(split).length > 2) {
              toSplit = split
              break
            }
          }

          if (toSplit) {
            txt.split(toSplit).filter(s => s)
              .forEach(task => this.addSubtask({
                name: task,
                index: this.task.checklist.length,
                ids: this.task.order
              }))
          }
        
        },
      },
      id: 'notes',
      select: true,
      vModel: 'notes', // this.model[option]
    },
  ],
  checklist: {
    vModel: 'checklist', // this.model[option]
    order: 'order', // this.model[option]
  }, // requires removeSubtask, saveChecklist, addSubtask, isRecurringItem methods
  allowFiles: {
    storageFolder: 'tasks', // requires file handle on firestore function
  },
  instance: {
    data() {
      return {
        toReplace: [],
        fromIconDrop: false,
        model: {
          name: '',
          notes: '',
          priority: '',
          assigned: '',
          taskDuration: '',
          deadline: '',
          folder: null,
          group: null,
          list: null,
          notes: '',
          calendar: null,
          heading: null,
          tags: [],
          checklist: [],
          order: [],
        },
        fromDefaultItem: false,
      }
    },
    created() {
      if (this.item) {
        if (this.item.calendar)
          this.fromDefaultItem = true
  
        if (this.item.tags)
          this.model.tags = this.item.tags.slice()
        if (this.item.checklist)
          this.model.checklist = this.item.checklist.slice()
        if (this.item.order)
          this.model.order = this.item.order.slice()
      }
    },
    methods: {
      saveByShortcut(type, task) {
        switch (type) {
          case 'CalendarPicker': {
            this.fromIconDrop = task !== null
            if (task !== null)
              this.toReplace = null
            
            this.model.calendar = task
            this.fromDefaultTask = false
            break
          }
          case 'save': {
            if (task.tags && task.tags.length > 0) {
              this.model = {
                ...this.model,
                tags: this.getTagsById(task.tags).map(el => el.name)
              }
            } else if (task.list) {
              this.model = {
                ...this.model,
                list: this.getListsById([task.list]).map(el => el.name)[0],
                heading: null,
                group: null,
                folder: null,
              }
            } else if (task.folder) {
              this.model = {
                ...this.model,
                folder: this.getFoldersById([task.folder]).map(el => el.name)[0],
                list: null,
                group: null,
                heading: null,
              }
            } else {
              this.model = {...this.model, ...task}
            }
          }
        }
      },
      beforeSave(model) {
        const m = model
        
        if (m.name) {
          if (m.group)
            m.tags = []

          let n = m.name
          if (this.toReplace)
            for (const s of this.toReplace)
              if (!this.fromIconDrop && s)
                n = n.replace(new RegExp(s), '')

          return {
            ...m,
            name: m.name.trim(),
            notes: m.notes.trim(),
          }
        }
      },
      afterSave(model) {
        model.checklist = []
        model.notes = ''
        model.name = ''
        model.order = []
      },
      
      parseKeyword(str) {
        const res = utils.calendarObjNaturalCalendarInput(str, this.userInfo.disablePmFormat)
        return res ? res.calendar : null
      },
      isRecurringItem(item) {
        return this.isRecurringTask(item)
      },
      addSubtask({name, index, ids}) {
        const id = utils.getUid()
        
        ids.splice(index, 0, id)
        this.model.order = ids
        this.model.checklist.push({
          name, completed: false, id,
        })
        this.saveChecklist()
      },
      saveChecklist() {
        if (this.item && this.model.checklist)
          this.$store.dispatch('task/saveTask', {
            id: this.model.id,
            checklist: this.model.checklist || [],
            order: this.model.order || [],
          })
      },
      removeSubtask(id) {
        const i = this.model.checklist.findIndex(el => el.id === id)
        this.model.checklist.splice(i, 1)
        this.saveChecklist()
      },

      addModelTag(id) {
        if (!this.model.tags)
          this.model.tags = []
        if (!this.model.tags.some(e => e === id))
          this.model.tags.push(id)
      },
    },
    computed: {
      calendarStr() {
        if (this.model.calendar)
          return utils.parseCalendarObjectToString(this.model.calendar, this.userInfo, true)
        return "Inbox"
      },
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
      leftSmartIconDrops() {
        const arr = [
          {
            id: 'checklist-icon',
            props: {
              placeholder: 'Checklist...',
              icon: 'menu',
              trigger: 'type',
            },
            onTrigger: (vm, getModel) => {
              vm.$refs.checklist.pushEditString(getModel)
            },
          },
          {
            id: 'add_files',
            props: {
              disabled: true,
              icon: 'file',
              trigger: 'click',
              file: true,
              onDrop: this.onDrop,
            },
          },
        ]

        if (this.model.calendar && !this.model.calendar.evening)
          arr.splice(1, 0, {
            id: 'evening_left_icon',
            props: {
              disabled: true,
              icon: 'moon',
              color: 'var(--dark-purple)',
              trigger: 'click',
              callback: () => {
                this.model.calendar = {
                  ...this.model.calendar,
                  evening: true,
                }
                this.fromIconDrop = true
              }
            },
          })

        return arr
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
                  callback: time => {this.model.taskDuration = time},
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
              callback: () => this.model.taskDuration = duration
            })

          return arr
        }
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
                  defaultTime: this.model.calendar,
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
                ...this.getSpecificDayCalendarObj(TOD_STR),
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
              model.calendar = {type: 'anytime'}
            }
          },
          {
            id: 'sa',
            name: 'Someday',
            icon: 'archive',
            color: 'var(--brown)',
            callback: model => {
              this.fromIconDrop = true
              model.calendar = {type: 'someday'}
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
      rightSmartIconDrops() {
        const arr = [
          {
            id: 'priority',
            props: {
              placeholder: 'Priority...',
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
          },
        ]

        if (!this.model.group)
          arr.push({
            id: 'tag',
            props: {
              placeholder: 'Tags...',
              icon: 'tag',
              color: 'var(--red)',
              trigger: 'enter',
              list: this.tags.map(el => ({
                id: el.id,
                name: el.name,
                icon: 'tag',
                color: 'var(--red)',
                callback: model => {
                  if (model.tags.includes(el.id)) {
                    const i = model.tags.findIndex(id => el.id)
                    model.tags.splice(i, 1)
                    this.cursorPos--
                  } else {
                    this.cursorPos++
                    model.tags.push(el.id)
                  }
                },
              })),
            },
          },)

        if (!this.model.taskDuration)
          arr.unshift({
            id: 'duration_clock',
            props: {
              placeholder: 'Duration...',
              icon: 'duration',
              color: 'var(--purple)',
              trigger: 'enter',
              compose: this.composeDurationList,
              list: this.durationList,
            },
          })

        if (!this.model.deadline)
          arr.unshift({
            id: 'deadline',
            props: {
              placeholder: 'Deadline...',
              icon: 'deadline',
              color: 'var(--orange)',
              trigger: 'enter',
              compose: this.deadlineListComposer,
              list: this.deadlineIconOptions,
            },
          })

        if (!this.isInAtLeastOneList)
          arr.unshift({
            id: 'lists',
            props: {
              placeholder: 'Move to...',
              icon: 'tasks',
              color: 'var(--primary)',
              listWidth: '180px',
              trigger: 'enter',
              list: getMoveToListOptions.apply(this),
            },
          })

        const listObj = this.getListObj

        if (!this.model.assigned && listObj && (listObj.group || this.model.group))
          arr.unshift({
            id: 'fdjkasçlasdf',
            props: {
              placeholder: 'Assign to...',
              icon: 'plus',
              listWidth: '180px',
              color: '',
              trigger: 'enter',
              list: this.getAssigneeIconDropLinks,
            },
          })
        
        if (!this.model.heading && listObj && listObj.headings && listObj.headings.length > 0)
          arr.unshift({
            id: 'headingsd_id',
            props: {
              placeholder: 'Heading...',
              icon: 'heading',
              listWidth: '180px',
              color: 'var(--primary)',
              trigger: 'enter',
              list: this.listHeadings,
            },
          })
        
        return arr
      },
      getAssignedName() {
        const iconDropObj = this.getAssignees
        if (iconDropObj)
          return iconDropObj.links.find(el => el.id === this.model.assigned).name
      },
      getListHeadingName() {
        const listObj = this.getListObj

        if (this.model.heading && listObj && listObj.headings && listObj.headings.length > 0)
          return listObj.headings.find(el => el.id === this.model.heading).name
      },
      listHeadings() {
        const listObj = this.getListObj

        if (listObj)
          return [
            {
              id: 'no_heading',
              name: 'No heading',
              icon: 'heading-slash',
              trigger: 'enter',
              callback: () => this.model.heading = null
            },
            ...listObj.headings.map(h => ({
              id: h.id,
              name: h.name,
              icon: 'heading',
              trigger: 'enter',
              callback: () => this.model.heading = h.id
            }))
          ]
      },
      getAssigneeIconDropLinks() {
        const iconDropObj = this.getAssignees
        if (iconDropObj)
          return iconDropObj.links.map(el => ({
                ...el,
                callback: () => {
                  if (el.name === "Remove assignee")
                    this.model.assigned = null
                  else this.model.assigned = el.id
                }
              }))
      },
      isInAtLeastOneList() {
        return this.model.list || this.model.folder || this.model.group
      },
      getListObj() {
        if (this.model.list)
          return this.getListsById([this.model.list])[0]
        if (this.model.folder)
          return this.getFoldersById([this.model.folder])[0]
        if (this.model.group)
          return this.getGroupsById([this.model.group])[0]
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
      calendarTagObj() {
        const name = this.calendarStr
        
        return {
          id: 'calendar_tag',
          props: {
            name,
            icon: this.getCalendarStrIcon,
            color: this.getCalendarStrColor,
            trigger: 'enter',
            compose: this.composeCalendarListHelper,
            list: this.calendarSmartIconOptions,
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
              callback: () => {
                const i = this.model.tags.findIndex(el => el === tag.id)
                if (i > -1)
                  this.model.tags.splice(i, 1)
              },
            },
          }))
      },
      getAssignees() {
        let group
        const listObj = this.getListObj

        if (this.model.group)
          group = this.model.group
        else if (listObj.group)
          group = listObj.group

        if (group)
          return this.getAssigneeIconDrop({group})
      },
      durationStr() {
        if (this.model.taskDuration)
          return 'Takes ' + utils.formatQuantity(this.model.taskDuration)
        return null
      },
      getViewTags() {
        const tags = []

        tags.push(this.calendarTagObj)

        if (this.model.calendar && this.model.calendar.evening)
          tags.push({
            id: 'evening_left_icon',
            props: {
              icon: 'moon',
              name: 'Evening',
              color: 'var(--dark-purple)',
              trigger: 'click',
              callback: () => this.model.calendar = {
                ...this.model.calendar,
                evening: false,
              }
            },
          })

        if (this.model.deadline)
          tags.push({
            id: 'deadline',
            props: {
              name: utils.getHumanReadableDate(this.model.deadline),
              icon: 'deadline',
              color: 'var(--orange)',
              trigger: 'enter',
              compose: this.deadlineListComposer,
              list: this.deadlineIconOptions,
            },
          })

        const listObj = this.getListObj

        if (this.isInAtLeastOneList && listObj)
          tags.push({
            id: 'lists_tag',
            props: {
              name: listObj.name,
              icon: this.getListIcon,
              listWidth: '180px',
              color: this.getListColor,
              trigger: 'enter',
              list: getMoveToListOptions.apply(this),
            },
          })

        if (this.model.assigned)
          tags.push({
            id: 'assigned',
            props: {
              name: this.getAssignedName,
              icon: 'user',
              listWidth: '180px',
              trigger: 'enter',
              list: this.getAssigneeIconDropLinks,
            },
          })

        if (this.model.heading && listObj && listObj.headings && listObj.headings.length > 0)
          tags.push({
            id: 'headingsd_id',
            props: {
              name: this.getListHeadingName,
              icon: 'heading',
              listWidth: '180px',
              color: 'var(--primary)',
              trigger: 'enter',
              list: this.listHeadings,
            },
          })

        if (this.model.taskDuration)
          tags.push({
            id: 'duration_clock',
            props: {
              name: this.durationStr,
              icon: 'duration',
              color: 'var(--purple)',
              trigger: 'enter',
              compose: this.composeDurationList,
              list: this.durationList,
            },
          })
        
        return tags.concat(this.model.group ? [] : this.getTagsLabels)
      },
    },
    watch: {
      // TODO: change icon color by priority
      'model.name'() {
        const n = this.model.name
        let changedOptions = false

        const send = arr => this.$emit('set-first-field-options', arr) // Show options array dropdown
        // this.currentPrefix - Used when selecting an options array element

        const match = (prefix, arr, onFind) => {
          const didChange = this.match(n, prefix, arr, onFind)
          if (didChange)
            changedOptions = true
        }

        const { priority, str } = taskUtils.parsePriorityFromString(n)
        if (priority !== null) {
          this.model.name = str
          this.model.priority = priority
        }

        match('#', this.tags, tag => this.addModelTag(tag.id))
        match('@', this.lists, list => {
          this.model.list = list.id
          this.model.group = list.group || null
          this.model.folder = null
          this.model.assigned = null
        })
        match('$', this.folders, folder => {
          this.model.folder = folder.id || null
          this.model.list = null
          this.model.group = null
          this.model.heading = null
          this.model.assigned = null
        })
        match('%', this.groups, group => {
          this.model.folder = null
          this.model.list = null
          this.model.group = group.id || null
          this.model.heading = null
          this.model.assigned = null
        })

        if (!this.isFirstEdit) {
          const res = utils.calendarObjNaturalCalendarInput(n, this.userInfo.disablePmFormat)
          this.toReplace = res.matches
          if (res && res.calendar) {
            this.model.calendar = res.calendar
            this.fromDefaultItem = false
            this.fromIconDrop = null
          } else if (!this.fromIconDrop && !this.fromDefaultItem) {
            this.fromDefaultItem = false
            this.model.calendar = null
          }
        }

        if (!changedOptions) send([])
        if (this.model.name !== this.value)
          this.$emit('input', this.model.name)
      },
      'model.priority'() {
        const obj = {
          "High priority": "var(--red)",
          "Medium priority": "var(--yellow)",
          "Low priority": "var(--primary)",
        }
        this.$emit('icon-color', obj[this.model.priority] || '')
      },
    },
  }
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
