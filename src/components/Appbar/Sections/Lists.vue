<template>
  <div class="Lists">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--red)'
      :disableSelection='true'
      :enableSort="true"
      :list="rootLists"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      :mapString='mapString'
      :onSortableAdd="rootAdd"
      @buttonAdd='buttonAdd'
      @update='update'
    />
    <transition-group
      class="folders-root"
      tag="div"
      :class="{isDragginInnerList}"
      @enter='enter'
      @leave='leave'

      data-name='folders-root'
    >
      <FolderApp v-for="f in sortedFolders" :key="f.id"
        v-bind="f"
        :movingFolder='movingFolder'

        :data-id='f.id'

        data-type='folder'
      >
        <Renderer
          type="list"
          icon="tasks"
          iconColor='var(--red)'
          :folder='f.id'
          :disableSelection='true'
          :enableSort="true"
          :list="getListsByFolderId({id: f.id, lists: listsWithFolders})"
          :active="active"
          :viewType="viewType"
          :mapProgress='getListProgress'
          :mapNumbers="(tasks) => tasks"
          :mapHelpIcon='getListIcon'
          :mapString='mapString'
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

import mom from 'moment/src/moment'

import { Sortable } from 'sortablejs'

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
      group: {name: 'folders', pull: (e) => {
        const name = e.el.dataset.name
        console.log(name)
        if (name === 'task-renderer') return 'clone'
        return false
      }, put: (l,j,item) => {
        const type = item.dataset.type
        if (type === 'task') return true
        return false
      }},
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
    enter(el) {
      const h = el.getElementsByClassName('header')[0].style
      const s = el.style
      
      s.margin = '0'
      s.opacity = '0'
      h.height = '0'
      h.transitionDuration = '0s'
      s.transitionDuration = '0s'
      setTimeout(() => {
        h.transitionDuration = '.15s'
        s.transitionDuration = '.15s'
        h.height = '35px'
        s.opacity = '1'
        s.margin = '12px 0'
      })
    },
    leave(el) {
      const h = el.getElementsByClassName('header')[0].style
      const s = el.style

      s.margin = '0'
      h.transitionDuration = '.15s'
      s.transitionDuration = '.15s'
      s.opacity = '0'
      h.height = '0'
    },
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

      return arr.length > 0 ? arr : undefined
    },
    mapString(list) {
      if (list.deadline && !(list.calendar && list.calendar.type !== 'someday')) {
        const isOverdue = list.deadline && mom().isAfter(mom(list.deadline, 'Y-M-D'), 'day')
        return {
          name: isOverdue ? this.l['overdue'] : `${mom(list.deadline, 'Y-M-D').diff(mom(), 'd') + 1} ${this.l['days left']}`,
          color: isOverdue ? 'var(--red)' : ''
        }
      } else if (list.calendar && list.calendar.type !== 'someday') {
        const { nextCalEvent } = utils.getCalendarObjectData(list.calendar, mom())
        return {
          name: `${mom(nextCalEvent.format('Y-M-D'), 'Y-M-D').diff(mom(), 'd') + 1} ${this.l['days left']}`,
          color: '',
        }
      }
      return null
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
          if (!l.calendar || l.calendar.type === 'someday') return true
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
