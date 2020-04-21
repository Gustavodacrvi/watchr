
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
  allowFiles: true, // requires file handle on firestore function
  instance: {
    data() {
      return {
        toReplace: [],
        fromIconDrop: false,
        model: {
          name: '',
          notes: '',
          color: null,
          defaultShowing: true,
          files: [],
        },
      }
    },
    methods: {
      beforeSave(model) {
        const m = model
        
        if (m.name)
          return {
            ...m,
            name: m.name.trim(),
            notes: m.notes.trim(),
          }
      },
      afterSave(model) {
        model.notes = ''
        model.name = ''
      },
    },
    computed: {
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

        if (!this.model.color || !this.selectedColorObj)
          arr.push(this.colorRightSmartIconObj)

        return arr
      },
      getViewTags() {
        const arr = []

        if (this.model.color && this.selectedColorObj)
          arr.push({
            id: 'color',
            props: {
              title: 'Alt + O',
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
