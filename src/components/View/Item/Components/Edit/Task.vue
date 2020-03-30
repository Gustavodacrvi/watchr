
<script>

import EditBuilder from './EditBuilder.js'

import utils from "@/utils/"
import taskUtils from "@/utils/task"

export default EditBuilder({
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
      vModel: 'notes', // this.model[option]
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

        const send = arr => this.$emit('input', arr) // Show options array dropdown
        // this.currentPrefix - Used when selecting an options array element

        const match = (prefix, arr, onFind) => {
          for (const el of arr) {
            const elName = ` ${prefix}${el.name}`
            if (n.includes(elName)) {
              this.model.name = n.replace(elName, '')
              onFind(el)
              break
            }
          }

          const split = n.split(' ')
          const lastWord = split[split.length - 1]
          if (lastWord[0] === prefix) {
            this.currentPrefix = prefix
            const word = lastWord.substr(1)

            send(
              arr.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
            )
            changedOptions = true
          }
        }

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
      },
    },
  }
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
