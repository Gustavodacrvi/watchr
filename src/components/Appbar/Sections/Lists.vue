<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--purple)'
      :disableSelection='true'
      :enableSort="true"
      :illustration="illustration"
      :list="rootLists"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      :mapBorder='mapBorder'
      :onSortableAdd="rootAdd"
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <transition-group
      class="folders-root"
      tag="div"
      :class="{isDragginInnerList}"

      data-name='folders-root'
    >
      <FolderApp v-for="f in sortedFolders" :key="f.id"
        v-bind="f"
        :movingFolder='movingFolder'

        :data-id='f.id'
      >
        <Renderer
          type="list"
          icon="tasks"
          iconColor='var(--purple)'
          :folder='f.id'
          :disableSelection='true'
          :enableSort="true"
          :list="getListsByFolderId({id: f.id, lists: listsWithFolders})"
          :active="active"
          :viewType="viewType"
          :mapProgress='getListProgress'
          :mapNumbers="(tasks) => tasks"
          :mapHelpIcon='getListIcon'
          :mapBorder='mapBorder'
          :onSortableAdd='betweenFolders'

          @is-moving='v => isDragginInnerList = v'
          @buttonAdd='obj => folderButtonAdd(f.id, obj)'
          @update='ids => updateFolderIds(f.id, ids)'
        />
      </FolderApp>
    </transition-group>
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

import { MultiDrag, Sortable } from 'sortablejs'

Sortable.mount(new MultiDrag())

export default {
  components: {
    Renderer: RendererVue, FolderApp,
  },
  props: ['active', 'viewType', 'showDefered', 'showRepeat'],
  data() {
    return {
      movingFolder: false,
      isDragginInnerList: false,
    }
  },
  mounted() {
    const el = this.$el.getElementsByClassName('folders-root')[0]
    const headsSor = new Sortable(el, {
      group: {name: 'folders', put: false, pull: false},
      delay: 225,
      delayOnTouchOnly: true,
      handle: '.handle-folder',

      onUpdate: (evt) => {
        const ids = this.getFolderIds()
        this.$store.dispatch('folder/updateFoldersOrder', ids)
      },
      onStart: evt => {
        this.movingFolder = true
      },
      onEnd: evt => {
        this.movingFolder = false
      },
    })
  },
  methods: {
    betweenFolders(folder, id, ids) {
      this.$store.dispatch('folder/moveListBetweenFolders', {
        folder, id, ids,
      })
    },
    rootAdd(folder, id, ids) {
      this.$store.dispatch('folder/moveListToRoot', {
        id, ids,
      })
    },
    getFolderIds() {
      const el = this.$el.getElementsByClassName('folders-root')[0]
      if (el) {
        const childs = el.childNodes
        const arr = []
        for (const c of childs) {
          arr.push(c.dataset.id)
        }
        return arr
      }
    },
    updateFolderIds(id, ids) {
      this.$store.dispatch('folder/updateOrder', {id, ids})
    },
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
    buttonAdd(obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj}})
    },
    folderButtonAdd(id, obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj, folderId: id}})
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
      sortedFolders: 'folder/sortedFolders',
      getListsByFolderId: 'folder/getListsByFolderId',
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
    listsWithFolders() {
      const lists = this.filteredByRepeat

      const arr = []
      for (const f of lists) if (f.folder) arr.push(f)

      return arr
    },

    rootLists() {
      const lists = this.filteredByRepeat

      const arr = []
      for (const f of lists) if (!f.folder) arr.push(f)
      
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

<style scoped>

.isDragginInnerList {
  pointer-events: none;
}

</style>
