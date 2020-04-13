<template>
  <div class="Checklist" :class="{isAddingChecklist: hasEdit}">
    <div
      class="draggable-root"
      ref="draggable-root"
    >
      <template v-for="sub in getItems">
        <Subtask v-if="!sub.isEdit"
          :ref='sub.id'
          :key="sub.id"
          v-bind='sub'
          @toggle='toggleTask(sub.id)'
          @remove='remove(sub.id)'
          @save='str => sub.name = str'

          @move-cursor-up='removeEdit(-1)'
          @move-cursor-down='removeEdit(1)'

          :active='sub.id === activeChecklistId'
          :compareDate='compareDate'

          data-type='subtask'
          :data-id='sub.id'
          :data-name='sub.name'
        />
        <SubtaskEdit v-else
          ref='Edit'
          :key="sub.isEdit"
          data-id='Edit'

          @add='addSubtask'

          @move-cursor-up='removeEdit(-1)'
          @move-cursor-down='removeEdit(1)'

          @cancel='removeEdit'

          @goup='moveTaskRenderer("up")'
          @godown='moveTaskRenderer("down")'
        />
      </template>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'

import Subtask from './Subtask.vue'
import SubtaskEdit from './Edit.vue'

import mom from 'moment'

import { Sortable } from 'sortablejs'

import utils from '@/utils/'
import { mapGetters } from 'vuex'

export default {
  props: ['list', 'compareDate', 'activeChecklistId'],
  components: {
    Subtask,
    SubtaskEdit,
  },
  data() {
    return {
      sortable: null,
      hasEdit: false,
      edit: null,
      addedTask: true,
      editIndex: 0,
    }
  },
  mounted() {
    this.sortable = new Sortable(this.draggableRoot, {
      group: {name: 'sub-task-renderer',
        put: (j,o,item) => {
          const type = item.dataset.type
          if (type === 'add-task-floatbutton') return true
          if (type === 'Task') return true
          return false
        }
      },
      sort: true,
      disabled: false,
      direction: 'vertical',
      delay: this.isDesktopBreakPoint ? 0 : 50,
      animation: 200,
      handle: '.item-handle',


      onUpdate: () => {
        this.$emit('update', this.getIds(true))
      },
      onAdd: (evt) => {
        const item = evt.item
        const type = item.dataset.type

        if (type === 'add-task-floatbutton') {

          this.addEdit(evt.newIndex)

        }
        item.remove()
      },
      onStart: () => {
        this.$store.commit('moving', true)
      },
      onEnd: () => {
        this.$store.commit('moving', false)
      },
    })
  },
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    editChecklist(id) {
      this.$refs[id][0].edit()
    },
    hide(evt) {
      const path = event.path || (event.composedPath && event.composedPath())
      let found
      for (const p of path)
        if (this.$refs.Edit && this.$refs.Edit.$el === p) {
          found = true
          break
        }
      if (!found)
        this.removeEdit()
    },
    pushEditString(getString) {
      this.addEdit(this.list.length)
      this.$nextTick(() => {
        if (getString)
          this.$refs.Edit[0].updateString(getString())
      })
    },
    addEdit(i) {
      this.removeEdit()
      const obj = {
        isEdit: true,
      }
      
      this.editIndex = i
      this.edit = obj
      this.hasEdit = true
      window.addEventListener('click', this.hide)
      
      this.$emit('is-adding-toggle', true)
    },
    removeEdit(moveDire = undefined) {
      const i = this.getItems.findIndex(el => el.isEdit)
      if (i > -1) {
        this.getItems.splice(i, 1)
        this.edit = null
        this.editIndex = null
        this.hasEdit = false

        this.$emit('is-adding-toggle', false)
        if (moveDire !== undefined)
          this.$emit('move-cursor', moveDire)
        else this.$emit('reset-cursor')

        window.removeEventListener('click', this.hide)
      }
    },
    toggleTask(id) {
      const subtask = this.list.find(el => el.id === id)
      subtask.completed = !subtask.completed
      if (subtask.completed)
        subtask.completeDate = mom().format('Y-M-D')
      else
        subtask.completeDate = null
      this.$emit('save-checklist')
    },
    remove(id) {
      this.$emit("remove", id)
    },
    moveTaskRenderer(dire) {
      const i = this.editIndex
      if (dire === 'up')
        this.editIndex--
      else this.editIndex++
    },
    addSubtask(name) {
      this.addedTask = true
      const index = this.editIndex
      this.editIndex++
      this.$emit('add', {
        name, ids: this.getIds(true),
        index,
      })
    },
    getIds(removeAdders) {
      const childs = this.draggableRoot.childNodes
      let ids = []
      for (const el of childs)
        ids.push(el.dataset.id)
      if (removeAdders)
        ids = ids.filter(id => id !== 'Edit')
      return ids
    },
    addChecklist() {
      setTimeout(() => this.addEdit(this.list.length))
    },
  },
  computed: {
    ...mapGetters(['isDesktopBreakPoint']),
    draggableRoot() {
      return this.$refs['draggable-root']
    },
    getItems() {
      const l = this.list.slice()
      if (this.edit)
        l.splice(this.editIndex, 0, this.edit)
      return l
    },
  },
}

</script>

<style>

.sortable-ghost .icons, .sortable-ghost .name-wrapper, .sortable-ghost .no-back {
  display: none !important;
  opacity: 0 !important;
}

</style>

<style scoped>

.Checklist {
  margin: 0;
  transition-duration: .15s;
}

.isAddingChecklist {
  padding: 0 9px;
  padding-bottom: 9px;
}

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

.sortable-drag {
  background-color: var(--light-gray) !important; 
  border-radius: 4px;
}

.sortable-ghost {
  background-color: var(--sidebar-color) !important;
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7),
    inset 0 -10px 5px -13px rgba(210,210,210, .7);
  height: 38px;
  padding: 0;
}

</style>
