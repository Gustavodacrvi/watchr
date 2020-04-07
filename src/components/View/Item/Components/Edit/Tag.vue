
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
  instance: {
    data() {
      return {
        toReplace: [],
        fromIconDrop: false,
        model: {
          name: '',
          notes: '',
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
  },
})

</script>

<style scoped src='@/assets/css/editBuilderStyles.css'></style>
