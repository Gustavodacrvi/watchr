<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--purple)'
      :disableSelection='true'
      :enableSort="true"
      :illustration="illustration"
      :list="rootFilters"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      :mapBorder='mapBorder'
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <FolderApp v-for="f in sortedFolders" :key="f.id"
      v-bind="f"
    >
      <Renderer
        type="list"
        icon="tasks"
        iconColor='var(--purple)'
        :disableSelection='true'
        :enableSort="true"
        :illustration="illustration"
        :list="rootFilters"
        :active="active"
        :viewType="viewType"
        :mapProgress='getListProgress'
        :mapNumbers="(tasks) => tasks"
        :mapHelpIcon='getListIcon'
        :mapBorder='mapBorder'
        @buttonAdd='buttonAdd'
        @update='update'
      />
    </FolderApp>
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'
import FolderApp from './Folder.vue'

import utilsList from '@/utils/list'
import utilsTask from '@/utils/task'
import utils from '@/utils'

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

export default {
  components: {
    Renderer: RendererVue, FolderApp,
  },
  props: ['active', 'viewType', 'showDefered', 'showRepeat'],
  methods: {
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj}})
    },
    getListProgress(list) {
      return this.$store.getters['list/pieProgress'](this.tasks, list.id)
    },
    getListIcon(list) {
      const arr = []
      if (list.deferDate)
        arr.push('sleep')
      if (list.deadline)
        arr.push('deadline')
      if (list.calendar)
        arr.push('repeat')

      return arr.length > 0 ? arr : undefined
    },
    mapBorder(list) {
      if (list.deadline && mom().isSameOrAfter(mom(list.deadline, 'Y-M-D')))
        return 'var(--red)'
      return 'none'
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
      user: state => state.user,
    }),
    ...mapGetters({
      l: 'l',
      getTasksByListId: 'list/getTasks',
      getListTasks: 'task/getListTasks',
      sortedFolders: 'folder/sortedFolders'
    }),
    sortedLists() {
      return this.$store.getters['list/sortedLists']
    },
    illustration() {
      let descr = this.l["You can add one by dropping the plus floating button in this region."]
      if (!this.isDesktop)
        descr = this.l["You can add one by clicking on the right corner icon."]
      return {
        descr,
        name: 'List',
        title: this.l["You don't have any lists."],
        width: '80px'
      }
    },

    rootFilters() {
      const filters = this.filteredByRepeat

      const arr = []
      for (const f of filters) if (!f.folder) arr.push(f)
      
      return arr
    },
    filteredByRepeat() {
      if (!this.showRepeat)
        return this.filteredByDefer.filter(l => {
          if (!l.calendar) return true
          const { lastCallEvent } = utils.getCalendarObjectData(l.calendar, mom())

          const tasks = this.getTasksByListId(this.tasks, l.id)
          let isAllTasksCompleted = true
          for (const el of tasks)
            if (!utilsTask.isTaskCompleted(el, mom(), lastCallEvent.format('Y-M-D'))) {
              isAllTasksCompleted = false
              break
            }

          return !isAllTasksCompleted || tasks.length === 0
        })
      return this.filteredByDefer
    },
    filteredByDefer() {
      if (!this.showDefered)
        return this.getLists.filter(l => {
          return !l.deferDate || mom().isSameOrAfter(mom(l.deferDate, 'Y-M-D'))
        })
      return this.getLists
    },
    getLists() {
      const lists = this.sortedLists
      for (const list of lists) {
        list.callback = () => {
          this.$router.push('/user?list=' + list.name)
        }
        const result = this.getListTasks(this.tasks, list.id).slice()
        list.options = utilsList.listOptions(list, this.$store, this.getListTasks(this.tasks, list.id).slice(), this.l)
      }
      return lists
    },
  },
}

</script>
