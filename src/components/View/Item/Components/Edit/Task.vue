
<script>

import EditBuilder from './EditBuilder.js'

import mom from 'moment'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

import utils from "@/utils/"
import taskUtils from "@/utils/task"

const saveByShortcut = (type, task) => {
  switch (type) {
    case 'CalendarPicker': {
      this.fromIconDrop = task !== null
      if (task !== null)
        this.toReplace = null
      
      this.task.calendar = task
      this.fromDefaultTask = false
      break
    }
    case 'save': {
      if (task.tags && task.tags.length > 0) {
        this.task = {
          ...this.task,
          tags: this.getTagsById(task.tags).map(el => el.name)
        }
      } else if (task.list) {
        this.task = {
          ...this.task,
          list: this.getListsById([task.list]).map(el => el.name)[0],
          heading: null,
          group: null,
          folder: null,
        }
      } else if (task.folder) {
        this.task = {
          ...this.task,
          folder: this.getFoldersById([task.folder]).map(el => el.name)[0],
          list: null,
          group: null,
          heading: null,
        }
      } else {
        this.task = {...this.task, ...task}
      }
    }
  }
}

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
          this.model.group = el.id
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


const calendarSmartIconOptions = [
  {
    id: 'tod',
    name: 'Today',
    icon: 'star',
    color: 'var(--yellow)',
    callback: model => model.calendar = vm.getSpecificDayCalendarObj(TOD_STR),
  },
  {
    id: 'eve',
    name: 'This evening',
    icon: 'moon',
    color: 'var(--dark-purple)',
    callback: model => model.calendar = {
      ...vm.getSpecificDayCalendarObj(TOD_STR),
      evening: true,
    },
  },
  {
    id: 'tom',
    name: 'Tomorrow',
    icon: 'sun',
    color: 'var(--orange)',
    callback: model => model.calendar = vm.getSpecificDayCalendarObj(TOD.clone().add(1, 'd').format('Y-M-D')),
  },
  {
    id: 'soa',
    name: 'Anytime',
    icon: 'layer-group',
    color: 'var(--olive)',
    callback: model => model.calendar = {type: 'anytime'},
  },
  {
    id: 'sa',
    name: 'Someday',
    icon: 'archive',
    color: 'var(--brown)',
    callback: model => model.calendar = {type: 'someday'},
  },
  {
    id: 's',
    name: 'Inbox',
    icon: 'inbox',
    color: 'var(--primary)',
    callback: model => model.calendar = null,
  },
]

const deadlineIconOptions = [
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
    id: 'o',
    name: 'No deadline',
    icon: 'bloqued',
    color: 'var(--txt)',
    callback: model => model.deadline = null
  },
]

export default EditBuilder({
  value: (v, vm) => vm.model.name = v,
  saveByShortcut,
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
  instance: {
    data() {
      return {
        model: {
          name: '',
          priority: '',
          assigned: '',
          taskDuration: '',
          deadline: '',
          folder: '',
          group: '',
          list: '',
          notes: '',
          calendar: null,
          heading: null,
          headingId: null,
          tags: [],
          checklist: [],
          order: [],
        },
        fromDefaultItem: false,
      }
    },
    created() {
      if (this.item.calendar)
        this.fromDefaultItem = true
    },
    methods: {
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

      addModelTag(name) {
        if (!this.model.tags)
          this.model.tags = []
        if (!this.model.tags.some(e => e === name))
          this.model.tags.push(name)
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
        return [
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
          {
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
                    vm.cursorPos--
                  } else {
                    vm.cursorPos++
                    model.tags.push(el.id)
                  }
                },
              })),
            },
          },
        ]

        if (!this.model.deadline)
          arr.unshift({
            id: 'deadline',
            props: {
              placeholder: 'deadline',
              icon: 'deadline',
              color: 'var(--orange)',
              trigger: 'enter',
              list: deadlineIconOptions,
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

        if (!this.model.assigned && listObj && (listObj.group || this.model.group)) {
          
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
        }
        
        return arr
      },
      getAssignedName() {
        const iconDropObj = this.getAssignees
        if (iconDropObj)
          return iconDropObj.links.find(el => el.id === this.model.assigned).name
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
            list: calendarSmartIconOptions,
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
      getViewTags() {
        const tags = []

        tags.push(this.calendarTagObj)

        if (this.model.deadline)
          tags.push({
            id: 'deadline',
            props: {
              name: utils.getHumanReadableDate(this.model.deadline),
              icon: 'Deadline...',
              color: 'var(--orange)',
              trigger: 'enter',
              list: deadlineIconOptions,
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
        
        return tags.concat(this.getTagsLabels)
      },
    },
    watch: {
      // TODO: change icon color by priority
      'model.name'() {
        const n = this.model.name
        let changedOptions = false

        const send = arr => this.$emit('set-first-field-options', arr) // Show options array dropdown
        // this.currentPrefix - Used when selecting an options array element

        const match = (prefix, arr, onFind) => this.match(n, prefix, arr, onFind)

        const { priority, str } = taskUtils.parsePriorityFromString(n)
        if (priority !== null) {
          this.model.name = str
          this.model.priority = priority
        }

        match('#', this.tags, tag => this.addModelTag(tag.name))
        match('@', this.lists, list => {
          this.model.list = list.id
          this.model.group = list.group
          this.model.folder = ''
          this.model.assigned = null
        })
        match('$', this.folders, folder => {
          this.model.folder = f.id
          this.model.list = ''
          this.model.group = ''
          this.model.heading = ''
          this.model.assigned = null
          this.model.headingId = ''
        })
        match('%', this.groups, group => {
          this.model.folder = ''
          this.model.list = ''
          this.model.group = f.id
          this.model.heading = ''
          this.model.assigned = null
          this.model.headingId = ''
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
          "Medium priority": "var(--orange)",
          "Low priority": "var(--primary)",
        }
        this.$emit('icon-color', obj[this.model.priority] || '')
      },
    },
  }
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
