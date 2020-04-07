
<script>

import EditBuilder from './EditBuilder.js'

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
  /* allowFiles: {
    storageFolder: 'lists',
  }, */
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
          calendar: '',
          color: '',
          headings: [],
          tags: [],
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
    },
    computed: {
      ...mapGetters({
        colors: 'colors',

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
      getFilteredMoveToListOptions() {
        return this.getMoveToListOptions.filter(el => el.name !== 'Move to list')
      },
      
      leftSmartIconDrops() {
        return []
      },
      rightSmartIconDrops() {
        const arr = []

        if (!this.model.folder && !this.model.group)
          arr.unshift({
            id: 'folder_and_group',
            props: {
              placeholder: 'Move to...',
              icon: 'tasks',
              color: 'var(--primary)',
              trigger: 'enter',
              list: this.getFilteredMoveToListOptions,
            },
          })

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
          arr.unshift(this.deadlineTagObj)

        if (!this.model.calendar)
          arr.unshift({
            id: 'calendar_icon',
            props: {
              placeholder: 'Defer...',
              icon: 'calendar',
              color: 'var(--green)',
              trigger: 'enter',
              compose: this.composeCalendarListHelper,
              list: this.calendarOptions,
            },
          })
        

        return arr
      },
      selectedColorObj() {
        return this.colors.find(el => el.color === this.model.color)
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
      getViewTags() {
        const arr = []

        if (this.model.calendar)
          arr.push({
            id: 'smart_icon_calendar',
            props: {
              name: this.calendarStr,
              icon: this.getCalendarStrIcon,
              color: this.getCalendarStrColor,
              trigger: 'enter',
              compose: this.composeCalendarListHelper,
              list: this.calendarOptions,
            },
          })
        
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
              list: this.getFilteredMoveToListOptions,
            },
          })

        if (this.model.color)
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

        return arr
      },
    },
  },
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
