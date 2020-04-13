
<script>

import EditBuilder from './EditBuilder.js'
import taskUtils from "@/utils/task"
import utils from "@/utils/"

import { mapGetters } from 'vuex'

export default EditBuilder({
  value: (v, vm) => vm.model.name = v,
  textFields: [
    {
      id: 'notes_field',
      props: {
        placeholder: 'Notes...',
        enterOnShift: true,
      },
      select: true,
      vModel: 'notes', // this.model[vModel],
    },
  ],
  allowFiles: {
    storageFolder: 'lists',
  },
  instance: {
    data() {
      return {
        toReplace: [],
        fromIconDrop: false,
        model: {
          name: '',
          notes: '',
          assigned: '',
          deadline: '',
          folder: null,
          group: null,
          list: null,
          calendar: null,
          color: '',
          headings: [],
          tags: [],
          files: [],
          headingsOrder: [],
          tasks: [],
        },
      }
    },
    created() {
      if (this.item) {
        if (this.item.calendar) {
          this.fromDefaultItem = true
          this.item.calendar = {...this.item.calendar}
        }

        if (this.item.tags)
          this.model.tags = this.item.tags.slice()
      }
    },
    methods: {
      isRecurringItem(item) {
        return this.isRecurringList(item)
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
            name: n.trim(),
            notes: m.notes.trim(),
          }
        }
      },
      afterSave(model) {
        model.notes = ''
        model.name = ''
      },
      addModelTag(id) {
        if (!this.model.tags)
          this.model.tags = []
        if (!this.model.tags.some(e => e === id))
          this.model.tags.push(id)
      },
    },
    computed: {
      ...mapGetters({
        isRecurringList: 'list/isRecurringList',
      }),

      getColorArr() {
        const getObj = item => ({
          id: item.name,
          name: item.name,
          icon: 'tint',
          color: item.color,
          trigger: 'enter',
          callback: () => this.model.color = item.color
        })

        return [
          {
            id: 'no_color',
            name: 'No color',
            icon: 'tint',
            trigger: 'enter',
            callback: () => this.model.color = null,
          },
          ...this.colors.map(getObj),
        ]
      },
      
      leftSmartIconDrops() {
        return [          {
          id: 'add_files',
          props: {
            disabled: true,
            icon: 'file',
            trigger: 'click',
            file: true,
            onDrop: this.onDrop,
          },
        }]
      },
      rightSmartIconDrops() {
        const arr = []

        if (!this.model.folder && !this.model.group)
          arr.unshift(this.rightSmartIconDurationObj)

        if (!this.model.group)
          arr.push(this.getSmartIconTags)

        if (this.model.assigned)
          tags.push(this.getAssigneTagObj)

        if (!this.model.color)
          arr.push({
            id: 'duration_clock',
            props: {
              placeholder: 'Color name...',
              icon: 'tint',
              color: 'var(--yellow)',
              trigger: 'enter',
              list: this.getColorArr,
            },
          })

        if (!this.model.deadline)
          arr.unshift(this.deadlineSmartIconObj)

        if (!this.model.calendar)
          arr.unshift(this.calendarSmartIconObj)

        const listObj = this.getListObj

        if (!this.model.assigned && listObj && (listObj.group || this.model.group))
          arr.unshift(this.getAssigneSmartIconObj)
        

        return arr
      },
      selectedColorObj() {
        return this.colors.find(el => el.color === this.model.color)
      },
      getViewTags() {
        const arr = []

        if (this.model.calendar)
          arr.push(this.calendarTagObj)
        
        if (this.model.deadline)
          arr.push(this.deadlineTagObj)

        const listObj = this.getListObj

        if (this.isInAtLeastOneList && listObj)
          arr.push({
            id: 'lists_tag',
            props: {
              name: listObj.name,
              icon: this.getListIcon,
              listWidth: '180px',
              color: this.getListColor,
              trigger: 'enter',
              list: this.getFilteredListMoveToListOptions,
            },
          })

        if (this.model.color && this.selectedColorObj)
          arr.push({
            id: 'color_tint',
            props: {
              name: this.selectedColorObj.name,
              icon: 'tint',
              color: this.selectedColorObj.color,
              trigger: 'enter',
              list: this.getColorArr,
            },
          })

        return arr.concat(this.model.group ? [] : this.getTagsLabels)
      },
    },
    watch: {
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

        match('#', this.tags, tag => this.addModelTag(tag.id))
        match('$', this.folders, folder => {
          this.model.folder = folder.id || null
          this.model.group = null
          this.model.assigned = null
        })
        match('%', this.groups, group => {
          this.model.folder = null
          this.model.group = group.id || null
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
    },
  },
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
