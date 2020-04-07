
<script>

import EditBuilder from './EditBuilder.js'

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
      leftSmartIconDrops() {
        return []
      },
      rightSmartIconDrops() {
        return []
      },
      getViewTags() {
        return []
      },
    },
  },
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
