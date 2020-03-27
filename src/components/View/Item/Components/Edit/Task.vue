
<script>

import EditBuilder from './EditBuilder.js'

export default EditBuilder({
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
},[
  {
    props: {
      placeholder: 'Notes...',
    },
    bindTo: 'notes',
  },
])

</script>
