
<script>

import EditBuilder from './EditBuilder.js'

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

/*
  'checklist-icon',
  'duration',
  'deadline',
  'file',
  'calendar',
  'group',
  'folder',
  'tasks',
  'priority',
  'tag',
*/

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
      ref: 'notes',
      select: true,
      vModel: 'notes', // this.model[option]
    },
  ],
  checklist: {
    vModel: 'checklist', // this.model[option]
    order: 'order', // this.model[option]
  }, // requires removeSubtask, saveChecklist, addSubtask, isRecurringItem methods
  leftSmartIconDrops: [
    {
      ref: 'checklist-icon',
      props: {
        placeholder: 'Checklist...',
        icon: 'menu',
        trigger: 'type',
      },
      onTrigger: (vm, getModel) => {
        vm.$refs.checklist.pushEditString(getModel)
      },
    },
  ],
  rightSmartIconDrops: [
    {
      ref: 'tag',
      props: {
        placeholder: 'Tags...',
        icon: 'tag',
        color: 'var(--red)',
        trigger: 'enter',
        listProperty: 'tags', // will be used on the list function, this[option]
        list: tags => tags.map(el => ({
          id: el.id,
          name: el.name,
          icon: 'tag',
          color: 'var(--red)',
          callback: model => {
            console.log(model)
            if (model.tags.includes(el.id)) {
              const i = model.tags.findIndex(id => el.id)
              model.tags.splice(i, 1)
            } else model.tags.push(el.id)
          },
        })),
      },
    },
  ],
  instance: {
    data() {
      return {
        model: {
          name: '',
          priority: '',
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
      }
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
        })
        match('$', this.folders, folder => {
          this.model.folder = f.id
          this.model.list = ''
          this.model.group = ''
          this.model.heading = ''
          this.model.headingId = ''
        })
        match('%', this.groups, group => {
          this.model.folder = ''
          this.model.list = ''
          this.model.group = f.id
          this.model.heading = ''
          this.model.headingId = ''
        })

        if (!this.isFirstEdit) {
          const res = utils.calendarObjNaturalCalendarInput(n, this.userInfo.disablePmFormat)
          this.toReplace = res.matches
          if (res && res.calendar) {
            this.model.calendar = res.calendar
            this.fromDefaultTask = false
            this.fromIconDrop = null
          } else if (!this.fromIconDrop && !this.fromDefaultTask) {
            this.fromDefaultTask = false
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
