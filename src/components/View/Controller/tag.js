import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewTag) {
        if (obj.task.tags.length === 0 || !obj.task.task.includes(this.viewTag.id))
          obj.task.tags.push(this.viewTag.id)
        this.$store.dispatch('task/addTask', {
          ...obj.task,
        })  
      }
    },
    saveHeaderName(name) {
      if (this.viewTag) {
        this.$router.push('/user?tag='+name)
        this.$store.dispatch('tag/saveTag', {
          name, id: this.viewTag.id
        })
      }
    },
    saveNotes(notes) {
      if (this.viewTag)
        this.$store.dispatch('tag/saveTag', {
          notes, id: this.viewTag.id
        })
    },
    addHeading() {},
    updateIds() {},
    updateHeadingIds() {},
    onSortableAdd() {},
  },
  computed: {
    icon() {return 'tag'},
    viewNameValue() {return this.viewName},
    getTasks() {
      if (this.viewTag)
        return this.tasks.filter(el => el.tags.includes(this.viewTag.id))
      return []
    },
    tasksOrder() {
      return []
    },
    headingsOptions() {
      return []
    },
    illustration() {
      const l = this.l
      return {
        name: 'SadTag',
        title: l["This tag doesn't have any tasks."],
        descr: l["How about adding one using the floating button?"],
        width: '150px',
      }
    },
    headerOptions() {
      let opt = []
      opt = [
          {
            name: this.l['Edit tag'],
            icon: 'pen',
            callback: () => {
              this.$store.dispatch('pushPopup', {
                comp: 'AddTag', payload: {...this.viewTag, editing: true}
              })
            }
          }
        ]
      if (!this.viewTag.notes) {
        opt.push({
          name: this.l['Add notes'],
          icon: 'note',
          callback: () => this.$store.dispatch('pushPopup', {
            comp: 'AddTagNote',
            payload: this.viewTag.id,
          })
        })
      }
      return opt
    },
    headingEdit() {
      return []
    },
    getViewNotes() {
      if (this.viewTag)
        return this.viewTag.notes
      return null
    },
    getPieProgress() {
      return undefined
    },
  },
}
