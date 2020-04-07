
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
    computed: {
      ...mapGetters(['colors']),

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
        return []
      },
      rightSmartIconDrops() {
        const arr = []

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

        return arr
      },
      selectedColorObj() {
        return this.colors.find(el => el.color === this.model.color)
      },
      getViewTags() {
        const arr = []

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
