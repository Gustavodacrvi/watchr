<template>
  <div class="Lists" :class="{movingTask}">
    <Renderer
      type="list"
      icon="tasks"
      iconColor='var(--primary)'
      :disableSelection='true'
      :enableSort="true"
      :list="getRootLists"
      :active="active"
      :viewType="viewType"
      :mapProgress='getListProgress'
      :mapNumbers="(tasks) => tasks"
      :mapHelpIcon='getListIcon'
      inputPlaceholder='List name...'
      :mapString='mapString'
      :onSortableAdd="rootAdd"

      alreadyExistMessage="This list already exists."
      :existingItems='sortedLists'

      :getItemRef='getItemRef'
      
      @update='update'
      @add='addListInRoot'
    />
    <transition-group
      class="folders-root"
      tag="div"
      :class="{isDragginInnerList, hasRootLists: getRootLists.length}"
      @enter='enter'
      @leave='leave'

      data-name='folders-root'
    >
      <template v-for="f in laseredFoldersAndGrups">
        <component :key="f.id"
          :is='f.comp'
        
          v-bind="f"
          :item='f'
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
            :mapNumbers="tasks => tasks"
            :mapHelpIcon='getListIcon'
            :mapString='mapString'
            :onSortableAdd='(folder, id, ids) => betweenFolders(folder, id, ids, f.comp)'

            alreadyExistMessage="This list already exists."
            :existingItems='sortedLists'

            :fallbackItem='fallbackItem(f.id)'
            :getItemRef='getItemRef'

            @is-moving='v => isDragginInnerList = v'
            @update='ids => updateFolderIds(f.id, f.comp, ids)'
            @add='obj => addList(obj, f.comp)'
          />
        </component>
      </template>
    </transition-group>
    <div style="height: 100px"></div>
  </div>
</template>

<script>

import RendererVue from '../Renderer.vue'
import Folder from './Folder.vue'
import Group from './Group.vue'

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
    Renderer: RendererVue, Folder,
    Group,
  },
  props: ['active', 'viewName', 'viewType', 'showDefered', 'showRepeat'],
  data() {
    return {
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
      delay: this.isDesktop ? 5 : 150,
      filter: '.ignore-item',
      animation: 200,
      handle: '.handle-folder',

      onUpdate: (evt) => {
        const ids = this.getFolderIds()
        this.$store.dispatch('folder/updateFoldersOrder', ids)
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
    addList(obj, comp) {
      if (comp === "Group")
        this.$store.dispatch('list/addListInGroupByIndex', obj)
      else
      
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
    betweenFolders(folder, id, ids, comp) {
      if (comp === "Group")
        this.$store.dispatch('group/moveListBetweenGroups', {
          group: folder, id, ids,
        })
      else
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
    updateFolderIds(id, comp, ids) {
      if (comp === 'Group')
        this.$store.dispatch('group/updateOrder', {id, ids})
      else
        this.$store.dispatch('folder/updateOrder', {id, ids})
    },
    update(ids) {
      this.$store.dispatch('list/updateOrder', ids)
    },
    getListProgress(list) {
      return this.$store.getters['list/pieProgress'](this.$store.getters['task/allTasks'], list.id, task => this.isTaskInView(task, "Logbook"))
    },
    getListIcon(list) {
      const arr = []
      if (list.deferDate)
        arr.push('sleep')

      return arr.length > 0 ? arr : undefined
    },
    mapString(list) {
      if (list.deadline && !list.calendar)
        return {
          name: this.getListDeadlineDaysLeftStr(list.deadline, TOD_STR)
,
          color: 'var(--red)'
        }
      else if (list.calendar)
        return {
          name: utils.parseCalendarObjectToString(list.calendar, this.userInfo),
          color: 'var(--txt)',
        }
      
      return null
    },
  },
  computed: {
    ...mapState({
      movingTask: state => state.movingTask,
      user: state => state.user,

      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      tasks: 'task/tasks',
      isDesktop: 'isDesktop',
      isTaskInList: 'task/isTaskInList',
      sortedFoldersAndGroups: 'folder/sortedFoldersAndGroups',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskInView: 'task/isTaskInView',
      getListsByFolderId: 'folder/getListsByFolderId',
      getListsByGroupId: 'group/getListsByGroupId',
      getLaterLists: 'list/getLaterLists',

      sortedLists: 'list/sortedLists',
      filterSidebarLists: 'list/filterSidebarLists',
      getListDeadlineDaysLeftStr: 'list/getListDeadlineDaysLeftStr',
    }),
    laseredFoldersAndGrups() {
      const sortedFoldersAndGroups = this.sortedFoldersAndGroups
      sortedFoldersAndGroups.forEach(fold => {
        if (!fold.isGroup) {
          fold.list = this.filterSidebarLists(
            this.getListsByFolderId({id: fold.id, lists: this.listsWithFolders})
          )

          fold.comp = "Folder"
        } else {
          fold.comp = "Group"
          fold.list = this.filterSidebarLists(
            this.getListsByGroupId({
              id: fold.id,
              lists: this.getLists,
            })
          )
        }
      })
      return sortedFoldersAndGroups
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
      for (const f of lists) if (!f.folder && !f.group) arr.push(f)
      
      return arr
    },
    getRootLists() {
      let arr = this.rootLists.slice()

      const laterLists = this.getLaterLists()
      const length = laterLists.length
      if (length) {
        arr.push({
          icon: 'later-lists',
          ignore: true,
          name: `${length} later list${length === 1 ? '' : 's'}`,
          id: 'later lists',
          stopProgress: true,
          callback: () => {
            this.$router.push('/user?list=Later lists')
          }
        })
      }

      return arr
    },
    filteredLists() {
      return this.filterSidebarLists(this.getLists)
    },
    getLists() {
      const lists = this.sortedLists.map(el => ({...el}))
      for (const list of lists) {
        list.callback = () => {
          this.$router.push('/user?list=' + list.name)
        }
        list.options = utilsList.listOptions(list)
        list.iconClick = () => {
          this.$store.dispatch('list/completeLists', [list])
        }
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

<style scoped>

.hasRootLists {
  margin-top: 28px;
}

.folders-root {
  min-height: 15px;
}

</style>
