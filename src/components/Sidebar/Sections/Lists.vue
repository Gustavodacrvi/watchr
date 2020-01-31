<template>
  <div class="Lists" :class="{movingTask}">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--primary)'
      :disableSelection='true'
      :enableSort="true"
      :list="rootLists"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      inputPlaceholder='List name...'
      :mapString='mapString'
      :onSortableAdd="rootAdd"

      :getItemRef='getItemRef'
      
      @buttonAdd='buttonAdd'
      @update='update'
      @add='addListInRoot'
    />
    <transition-group
      class="folders-root"
      tag="div"
      :class="{isDragginInnerList}"
      @enter='enter'
      @leave='leave'

      data-name='folders-root'
    >
      <FolderApp v-for="f in laseredFolders" :key="f.id"
        v-bind="f"
        :movingFolder='movingFolder'
        :folder='f'
        :viewName='viewName'
        :viewType='viewType'
        :listLength='f.list.length'

        :data-id='f.id'

        data-type='folder'
      >
        <Renderer
          type="list"
          icon="tasks"
          iconColor='var(--primary)'
          inputPlaceholder='List name...'
          :folder='f.id'
          :disableSelection='true'
          :enableSort="true"
          :list="f.list"
          :active="active"
          :viewType="viewType"
          :mapProgress='getListProgress'
          :mapNumbers="(tasks) => tasks"
          :mapHelpIcon='getListIcon'
          :mapString='mapString'
          :onSortableAdd='betweenFolders'

          :fallbackItem='fallbackItem(f.id)'
          :getItemRef='getItemRef'

          @is-moving='v => isDragginInnerList = v'
          @buttonAdd='obj => folderButtonAdd(f.id, obj)'
          @update='ids => updateFolderIds(f.id, ids)'
          @add='addList'
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
import { listRef } from '@/utils/firestore'

import { mapGetters, mapState } from 'vuex'

import mom from 'moment'

const TOD_STR = mom().format('Y-M-D')

import { Sortable } from 'sortablejs'

export default {
  components: {
    Renderer: RendererVue, FolderApp,
  },
  props: ['active', 'viewName', 'viewType', 'showDefered', 'showRepeat'],
  data() {
    return {
      movingFolder: false,
      isDragginInnerList: false,
      sortable: null,
    }
  },
  mounted() {
    const el = this.$el.getElementsByClassName('folders-root')[0]
    this.sortable = new Sortable(el, {
      group: {name: 'folders', pull: (e) => {
        const name = e.el.dataset.name
        if (name === 'item-renderer') return 'clone'
        return false
      }, put: (l,j,item) => {
        const type = item.dataset.type
        if (type === 'Task') return true
        return false
      }},
      delay: 225,
      animation: 80,
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
  beforeDestroy() {
    this.sortable.destroy()
  },
  methods: {
    fallbackItem(folder) {
      return obj => ({...obj, folder})
    },
    getItemRef() {
      return listRef()
    },
    addList(obj) {
      this.$store.dispatch('list/addListInFolderByIndex', obj)
    },
    addListInRoot(obj) {
      this.$store.dispatch('list/addListInRootByIndex', obj)
    },
    
    enter(el) {
      const h = el.getElementsByClassName('header')[0].style
      const s = el.style
      
      s.opacity = '0'
      h.height = '0'
      h.transitionDuration = '0s'
      s.transitionDuration = '0s'
      requestAnimationFrame(() => {
        h.transitionDuration = '.15s'
        s.transitionDuration = '.15s'
        h.height = (this.isDesktop ? 35 : 42) + 'px'
        s.opacity = '1'
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
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj}, naked: true})
    },
    folderButtonAdd(id, obj) {
      this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...obj, folderId: id}, naked: true})
    },
    getListProgress(list) {
      return this.$store.getters['list/pieProgress'](this.tasks, list.id, task => this.isTaskInView(task, "Completed"))
    },
    getListIcon(list) {
      const arr = []
      if (list.deferDate)
        arr.push('sleep')

      return arr.length > 0 ? arr : undefined
    },
    mapString(list) {
      if (list.deadline)
        return {
          name: this.getListDeadlineDaysLeftStr(list.deadline, TOD_STR)
,
          color: 'var(--red)'
        }
      
      return null
    },
  },
  computed: {
    ...mapState({
      movingTask: state => state.movingTask,
      user: state => state.user,
    }),
    ...mapGetters({
      tasks: 'task/tasks',
      isDesktop: 'isDesktop',
      isTaskInList: 'task/isTaskInList',
      sortedFolders: 'folder/sortedFolders',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskInView: 'task/isTaskInView',
      getListsByFolderId: 'folder/getListsByFolderId',

      filterSidebarLists: 'list/filterSidebarLists',
      getListDeadlineDaysLeftStr: 'list/getListDeadlineDaysLeftStr',
    }),
    laseredFolders() {
      const sortedFolders = this.sortedFolders
      sortedFolders.forEach(fold => {
        fold.list = this.filterSidebarLists(this.getListsByFolderId({id: fold.id, lists: this.listsWithFolders}))
      })
      return sortedFolders
    },
    sortedLists() {
      return this.$store.getters['list/sortedLists']
    },
    listsWithFolders() {
      const lists = this.filteredLists

      const arr = []
      for (const f of lists) if (f.folder) arr.push(f)

      return arr
    },

    rootLists() {
      const lists = this.filteredLists

      const arr = []
      for (const f of lists) if (!f.folder) arr.push(f)
      
      return arr
    },
    filteredLists() {
      return this.filterSidebarLists(this.getLists)
    },
    getLists() {
      const lists = this.sortedLists
      for (const list of lists) {
        list.callback = () => {
          this.$router.push('/user?list=' + list.name)
        }
        list.options = utilsList.listOptions(list)
        list.iconClick = () => {
          this.$store.dispatch('list/completeLists', [list])
        }
      }
      return lists.map(t => t)
    },
  },
}

</script>

<style scoped>

.isDragginInnerList {
  pointer-events: none;
}

</style>

<style scoped>

.folders-root {
  margin-top: 12px;
}

.folders-root {
  min-height: 15px;
}

</style>
