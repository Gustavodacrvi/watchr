<template>
  <div class="Checklist" :class="{hasAtLeastOnSubTask}">
    <div
      class="draggable-root"
      ref="draggable-root"
    >
      <template v-for="sub in getItems">
        <Subtask v-if="!sub.isEdit"
          :key="sub.id"
          v-bind='sub'
          @toggle='toggleTask(sub.id)'
          @remove='remove(sub.id)'
          @save='str => sub.name = str'

          @move-cursor-up='removeEdit(-1)'
          @move-cursor-down='removeEdit(1)'

          :active='sub.id === activeChecklistId'

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

import Sortable from 'sortablejs'

import utils from '@/utils/'

export default {
  props: ['order', 'list', 'activeChecklistId'],
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
      hasAtLeastOnSubTask: false,
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
      direction: 'vertical',
      delay: this.isDesktop ? 0 : 150,
      animation: 80,
      handle: '.item-handle',


      onUpdate: () => {
        this.$emit('update', this.getIds(true))
      },
      onAdd: (evt) => {
        const item = evt.item
        const type = item.dataset.type

        if (type === 'add-task-floatbutton') {

          this.addEdit(evt.newIndex)

        } else if (type === 'Task') {
          const childs = this.draggableRoot.childNodes
          let i = 0
          for (const c of childs) {
            if (c.dataset.id === item.dataset.id)
              break
            i++
          }
          this.$emit('convert-task', {
            index: i, id: item.dataset.id, ids: this.getIds(true)
          })
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
      if (this.getList && this.getList.length === 0)
        setTimeout(() => this.addEdit(0))
    },
  },
  computed: {
    draggableRoot() {
      return this.$refs['draggable-root']
    },
    getItems() {
      const l = this.getList.slice()
      if (this.edit)
        l.splice(this.editIndex, 0, this.edit)
      return l
    },
    getList() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.order, this.list)
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
  padding: 0 8px;
  transition: margin .15s;
}

.hasAtLeastOnSubTask {
  margin: 20px 0;
}

.trans-enter, .trans-leave-to {
  opacity: 0;
}

.trans-leave, .trans-enter-to {
  opacity: 1;
}

.sortable-drag {
  background-color: var(--light-gray) !important; 
  border-radius: 6px;
}

.sortable-ghost {
  background-color: var(--sidebar-color) !important;
  transition-duration: 0;
  height: 38px;
  padding: 0;
}

</style>
