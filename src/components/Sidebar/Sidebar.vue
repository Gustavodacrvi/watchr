<template>
  <div class="Sidebar-wrapper"
    :class="[layout, {'scroll-thin': isDesktopBreakPoint, 'slim-sidebar': slimMode, enableSidebarScroll: showing}]"

    id='sidebar-scroll'

    @mouseenter="sidebarHover = true"
    @mouseleave="sidebarHover = false"
  >
    <div class="margin-wrapper" :class="{'scroll-thin': slimMode}">
      <div v-if="isDesktopBreakPoint && !removeBacklayer"
        class="back-layer"
        :class="{showing, pressingHandle}"
        :style="{width}"
      ></div>
      <div class="inner-wrapper">
        <transition
          name="bar-trans"
        >
          <div v-if="showSidebarStuff && (!isDesktopBreakPoint || showing)" class="sidebar-content">
            <div class="sidebar-menus">
              <SidebarRenderer class="smart-items"
                type='list'
                :isSmart='true'
                :enableSort='true'
                :disabled='false'
                :disableSelection='true'
                :showColor='true'
                :list='getLinksOrdered'
                :active='value'
                :onTaskDrop='onTaskDrop'
                :viewType='viewType'

                :mapNumbers='numberOfTasks'
                @update='update'
              />
              <div class='favorites-div' :class='{showFavorites}'></div>
              <SidebarRenderer v-if="showFavorites"
                :enableSort='true'
                :disabled='false'
                :disableItemAdd='true'
                :isSmart='false'
                :disableSelection='true'
                :list='getFavoritesRenderList'
                :active='value'
                :viewType='viewType'

                :mapNumbers='mapFavorites'
                :mapProgress='mapProgress'
                @update='updateFavorites'
              />
              <div v-if="!isSingleSection" class="header">
                <div v-for="(s,i) in notHidedSections" :key="s.name"
                  class="option section-option"
                  :class="{sectionActive: s.name === section}"
                  :tabindex="i + 1 + links.length"
                  @click="moveLine(i)"
                  :data-section="s.name"
                >{{ s.name }}
                </div>
                <div class="line section-line"></div>
              </div>
              <div v-else style="margin-top: 24px"></div>
              <div class="comp-wrapper">
                <transition name="sect-trans"
                  @leave="leave"
                  @enter="enter"
                >
                  <component
                    class="component sidebar-section floating-btn-container"
                    :is="section"
                    :active="value"
                    :viewType='viewType'
                    :viewName='viewName'
                    :showDefered='showDefered'
                    :showRepeat='showRepeat'
                    :data-transindex="getSidebarIndex(section)"
                  />
                </transition>
              </div>
              <div class='extra-margin' style="height: 150px"></div>
            </div>
          </div>
        </transition>
        <SidebarFooter
          :class="[layout]"
          :render='showing && showSidebarStuff'
          :style="{width}"
          :slimMode='slimMode'
          :showIconDropdown='showIconDropdown'
          :getSectionOptions='getSectionOptions'
          :sideIcons='sideIcons'
          @toggle-scheduling='toggleScheduling'
        />
      </div>
    </div>
    <div v-if="isDesktopBreakPoint && !removeHandle"
      class="sidebar-handle passive"
      :class="{sidebarHover, sidebarHided}"
      :style="sidebarHandle"

      @pointerdown.prevent='pointerdown'
    ></div>
  </div>
</template>

<script>

import SidebarElementVue from './SidebarElement.vue'
import ListsVue from './Sections/Lists.vue'
import FiltersVue from './Sections/Filters.vue'
import TagsVue from './Sections/Tags.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import RendererVue from './Renderer.vue'
import SearchButtonVue from './SearchButton.vue'
import SidebarFooter from './Components/Footer.vue'

import { mapGetters, mapState, mapMutations } from 'vuex'

import utils from '@/utils'
import utilsList from '@/utils/list'
import utilsTag from '@/utils/tag'
import utilsFolder from '@/utils/folder'
import utilsGroup from '@/utils/group'

export default {
  props: ['value', 'width', 'sidebarHided', 'pressingHandle',
    'disableSearch', 'removeHandle', 'removeBacklayer',
    'slimMode', 'MINIMUM_WIDTH',
  ],
  components: {
    SidebarElement: SidebarElementVue,
    IconDrop: IconDropVue,
    Lists: ListsVue, SidebarFooter,
    Tags: TagsVue,
    Filters: FiltersVue,
    SidebarRenderer: RendererVue,
    SearchButton: SearchButtonVue,
  },
  data() {
    const links = this.$store.getters.sidebarElements

    links.forEach(link => {
      link.callback = () => this.$router.push(`/user?list=${link.name}`)
      link.id = link.name
    })

    
    return {
      links,
      sections: [
        {
          name: 'Lists',
        },
/*                 {
          name: 'Filters',
        }, */
        {
          name: 'Tags',
        },
      ],
      showing: true,
      sidebarHover: false,
      transRight: true,
      showingIconDrop: true,
      showingSearch: false,
      showDefered: false,
      showRepeat: false,
      searchTimeout: null,
      oldIndex: 0,
      section: 'Lists',
    }
  },
  created() {
    this.showing = !this.sidebarHided
    const saved = localStorage.getItem('section')
    if (saved) this.section = saved

    if (this.isSingleSection)
      this.section = this.notHidedSections[0].name
  },
  mounted() {
    setInterval(() => {
      this.moveLineToActive()
    }, 1000)
    this.moveLineToActive()
    window.addEventListener('resize', this.moveLineToActive)
  },  
  beforeDestroy() {
    window.removeEventListener('resize', this.moveLineToActive)
  },
  methods: {
    ...mapMutations(['toggleScheduling']),
    
    pointerdown(evt) {
      this.$emit('handle-pointerdown', evt)
    },
    handleMousemove(evt) {
      evt.preventDefault()
    },
    update(links) {
      this.$store.dispatch('setInfo', {
        links,
      })
    },
    updateFavorites(favorites) {
      this.$store.dispatch('setInfo', {
        favorites,
      })
    },
    showSearch() {
      this.showingSearch = true
      if (this.searchTimeout)
        clearTimeout(this.searchTimeout)
    },
    hideSearch() {
      this.searchTimeout = setTimeout(() => {
        this.showingSearch = false
      }, 1000)
    },
    onTaskDrop({taskId, elId}) {
      this.$store.dispatch('task/handleTasksBySidebarElementDragAndDrop', {
        elIds: [elId],
        taskIds: [taskId],
        type: elId,
      })
    },
    leave(el) {
      this.transRight = this.newIndex > this.oldIndex

      if (this.transRight) {
        el.classList.add('to-left')
      } else {
        el.classList.add('to-right')
      }
    },
    enter(el) {
      el.style.transitionDuration = '.0s'
      if (this.transRight) {
        el.classList.add('to-right')
      } else {
        el.classList.add('to-left')
      }
      requestAnimationFrame(() => {
        el.style.transitionDuration = '.15s'
        el.classList.remove('to-right')
        el.classList.remove('to-left')
      })

      this.oldIndex = this.newIndex
    },
    getSidebarIndex(name) {
      const obj = {
        Lists: 1,
        Filters: 2,
        Tags: 3,
      }
      return obj[name]
    },
    scroll(num) {
      this.$el.scrollTop += num
    },
    moveLineToActive() {
      if (this.$el) {
        const el = this.$el.getElementsByClassName('sectionActive')[0]
        const line = this.$el.getElementsByClassName('line')[0]
  
        if (el && line) {
          line.style.left = el.offsetLeft + 'px'
          line.style.width = el.offsetWidth + 'px'
        }
      }
    },
    moveLine(i) {
      const el = this.$el.getElementsByClassName('section-option')[i]
      const line = this.$el.getElementsByClassName('section-line')[0]

      if (el && line) {
        line.style.left = el.offsetLeft + 'px'
        line.style.width = el.offsetWidth + 'px'
  
        this.section = el.dataset.section
        localStorage.setItem('section', this.section)
      }
    },
    numberOfTasks(link) {
      const viewName = link.name
      if (viewName === 'Upcoming' || viewName === 'Someday' || viewName === 'Anytime')
        return {
          total: 0,
          notCompleted: 0,
        }
      const obj = this.getNumberOfTasksByView(viewName)
      if (viewName !== 'Today' && viewName !== 'Deadlines' && viewName !== 'Assigned to me')
        return {total: obj.total}
      const listNumbers = this.getNumberOfListsByView(viewName)
      return {
        notCompleted: obj.notCompleted + listNumbers.notCompleted,
        total: obj.total + listNumbers.total
      }
    },
    mapProgress(link) {
      if (link.type === 'list')
        return this.$store.getters['list/pieProgress'](link.id)
      return null
    },
    mapFavorites(link) {
      if (link.type === 'tag')
        return {
          total: this.getNumberOfTasksByTag(link.id).total,
        }

      return {
        total: 0
      }
    },
    getIconByType(type) {
      switch (type) {
        case 'Tags': return 'tag'
        case 'Lists': return 'tasks'
        // case 'Filters': return 'filter'
      }
    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
      userInfo: state => state.userInfo,
      viewName: state => state.viewName,
      viewType: state => state.viewType,
      scheduling: state => state.scheduling,
    }),
    ...mapGetters({
      tags: 'tag/tags',
      tasks: 'task/tasks',
      layout: 'layout',
      isStandAlone: 'isStandAlone',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      isDesktopDevice: 'isDesktopDevice',
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      getNumberOfTasksByView: 'task/getNumberOfTasksByView',
      getNumberOfListsByView: 'list/getNumberOfListsByView',
      favLists: 'list/getFavoriteLists',
      sortedFromMeInvites: 'invites/sortedFromMeInvites',
      sortedToMeInvites: 'invites/sortedToMeInvites',
      isTaskInView: 'task/isTaskInView',
      // getfavfilters
      isTaskCompleted: 'task/isTaskCompleted',
      favFolders: 'folder/getFavoriteFolders',
      favGroups: 'group/getFavoriteGroups',
      favTags: 'tag/getFavoriteTags',
    }),
    showSidebarStuff() {
      return parseInt(this.width, 10) > this.MINIMUM_WIDTH
    },
    isScheduling() {
      return !this.slimMode && this.scheduling
    },
    sidebarHandle() {
      return {
        left: (parseInt(this.width, 10) - 18) + 'px'
      }
    },
    sideIcons() {
      const opt = []

      const invites = this.sortedFromMeInvites
      if (invites.length > 0)
        opt.push({
          icon: 'paper-plane',
          id: 'asdfasdfasdfasd',
          number: invites.length,
          callback: () => this.$store.dispatch('pushPopup', {
            comp: 'SentInvites',
          }),
        })

      const fromOthers = this.sortedToMeInvites

      if (fromOthers.length > 0)
        opt.push({
          icon: 'message',
          id: 'message',
          number: fromOthers.length,
          callback: () => this.$store.dispatch('pushPopup', {
            comp: 'Invites',
          })
        })

      return [...opt, ...this.getHidedSectionsIcons]
    },
    getFavoritesRenderList() {
      const favs = this.getFavorites

      const selectView = (name, type) => {
        this.$router.push(`/user?${type}=${name}`)
      }
      const getOptions = (link, type) => {
        switch (type) {
          case 'list': {
            return utilsList.listOptions(this, link)
          }
          case 'tag': {
            return utilsTag.tagOptions(link)
          }
          case 'folder': {
            return utilsFolder.getFolderOptions(link)
          }
          case 'group': {
            return utilsGroup.getGroupOptions(link)
          }
        }
        return []
      }

      const final = []
      for (const f of favs) {
        const type = f.type ? f.type : f.icon
        final.push({
          type,
          rendererType: type,
          name: f.name,
          id: f.id,
          icon: f.icon,
          callback: () => selectView(f.name, type),
          iconColor: f.color,
          options: getOptions(f, type),
        })
      }

      return final
    },
    showFavorites() {
      return this.getFavoritesRenderList.length > 0
    },
    getFavArr() {
      return [
        ...this.favLists,
        ...this.favFolders,
        ...this.favGroups,
        ...this.favTags,
      ]
    },
    getFavorites() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.favoritesOrder, this.getFavArr)
    },
    favoritesOrder() {
      if (this.userInfo && this.userInfo.favorites)
        return this.userInfo.favorites
      return []
    },
    linksOrder() {
      if (this.userInfo && this.userInfo.links) {
        return this.userInfo.links
      }
      return [
        'Inbox',

        'DEFAULT_1',
        
        'Today',
        'Assigned to me',
        'Upcoming',
        'Anytime',
        'Someday',
        
        'DEFAULT_2',
        
        'Deadlines',
        'Logbook',
      ]
    },
    getLinksOrdered() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.linksOrder, this.smartMargins)
    },
    smartMargins() {
      const nonHidedLinks = this.nonHidedLinks
      if (this.userInfo && this.userInfo.margins)
        return [...nonHidedLinks, ...(this.userInfo.margins.map(el => ({id: el, isEmpty: true})).slice(0, (nonHidedLinks.length > 3) ? 2 : 1))
      ]
      return nonHidedLinks
    },
    nonHidedLinks() {
      if (!this.userInfo.hidedViews) return this.links
      return this.links.filter(link => !this.userInfo.hidedViews.includes(link.name))
    },
    getHidedSectionsIcons() {
      const sect = [...this.hidedSections.filter(el => el !== this.section && el !== 'Filters')]
      if (this.isSingleSection && this.notHidedSections[0].name !== this.section)
        sect.unshift(this.notHidedSections[0].name)
      return sect.map(el => ({
        name: el,
        icon: this.getIconByType(el),
        callback: () => {this.section = el}
      }))
    },
    hidedSections() {
      if (this.userInfo && this.userInfo.hidedSections) return this.userInfo.hidedSections
      return []
    },
    notHidedSections() {
      const res = this.sections.filter(s => !this.hidedSections.includes(s.name))
      if (res.length === 0) return [{name: 'Lists'}]
      return res
    },
    isSingleSection() {
      return this.notHidedSections.length === 1
    },
    showIconDropdown() {
      return this.getSectionOptions && !this.sidebarHided && this.showingIconDrop
    },
    getSectionOptions() {
      return this[this.section]
    },
    Tags() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Sort tags by name',
          icon: 'sort-name',
          callback: () => dispatch('tag/sortTagsByName')
        },
        {
          name: 'Add tag',
          icon: 'tag',
          callback: () => dispatch('pushPopup', {comp: 'AddTag', naked: true})
        }
      ]
    },
    Lists() {
      const dispatch = this.$store.dispatch
/*       const arr = [
        {
          name: 'Import from template',
          icon: 'import',
          file: true,
          accept: '.json',
          handleFiles: (files, promise // read txt file promise) => {
            const bug = () => {
              this.$store.commit('pushToast', {
                name: "An error ocurred while importing the JSON file, the file is corrupted.",
                seconds: 3,
                type: 'error'
              })
            }
            promise.then(data => {
              try {
                this.$store.dispatch('list/importTemplate', data)
              } catch (err) {
                bug()
              }
            }).catch(bug)
          }
        },
      ] */
      return {
        comp: 'InfoList',
        content: {
          width: '200px',
          links: [
            {
              name: 'Add folder',
              icon: {
                name: 'folder',
                color: 'var(--txt)',
              },
              info: `Keep your lists and tasks organized using folders.`,
              callback: () => dispatch('pushPopup', {comp: 'AddFolder', naked: true}),
            },
            {
              name: 'Add group',
              icon: {
                name: 'group',
                color: 'var(--yellow)',
              },
              info: `Share and assign your tasks and lists to other users.`,
              callback: () => dispatch('pushPopup', {comp: 'AddGroup', naked: true}),
            },
            {
              name: 'Add list',
              icon: {
                name: 'tasks',
                color: 'var(--primary)',
              },
              info: `Divide and conquer your tasks, you can also group them using headings.`,
              callback: () => dispatch('pushPopup', {comp: 'AddList', naked: true}),
            },
          ],
        }
      }
    },
    Filters() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Add filter',
          icon: 'filter',
          callback: () => dispatch('pushPopup', {comp: 'AddFilter', naked: true}),
        },
        {
          name: 'Sort filters by name',
          icon: 'sort-name',
          callback: () => dispatch('list/sortFiltersByName'),
        }
      ]
    },
    newIndex() {
      return this.getSidebarIndex(this.section)
    },
  },
  watch: {
    section() {
      this.$emit('section', this.section)
      this.showingIconDrop = false
      setTimeout(() => {
        this.showingIconDrop = true
      }, 200)
    },
    sidebarHided() {
      this.showing = !this.sidebarHided
    },
  }
}

</script>

<style scoped>

.sidebar-handle {
  position: fixed;
  background-color: var(--card);
  box-shadow: 0 2px 4px rgba(0,0,0,.3);
  width: 5px;
  height: 145px;
  margin-left: 9px;
  top: 50%;
  border-radius: 100px;
  transform: translateY(-50%);
  z-index: 100;
  cursor: pointer;
  opacity: 0 !important;
  transition: opacity .15s, background-color .15s, width .15s, transform .15s;
}

.sidebar-handle.sidebarHided {
  margin-left: 30px;
  opacity: 1;
  background-color: var(--extra-light-gray);
}

.sidebar-handle.sidebarHover {
  opacity: 1 !important;
}

.sidebar-handle:hover {
  cursor: grab;
  background-color: var(--extra-light-gray);
  width: 9px;
  transform: translate(-2px, -50%);
}

.sidebar-handle:active {
  cursor: grabbing;
}

.sidebar-content {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.slim-sidebar .sidebar-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
}

.Sidebar {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.margin-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.favorites-div {
  transition-duration: .2x;
  margin: 0;
}

.favorites-div.showFavorites {
  margin-top: 24px;
}

.inner-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
}

.slim-sidebar .inner-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.mobile .margin-wrapper {
  margin: 16px;
  margin-top: 0;
}

.Sidebar.mobile {
  padding-right: 0;
}

.Sidebar-wrapper {
  height: 100%;
  position: relative;
  top: 0;
  transition-duration: .15s;
}

.Sidebar-wrapper.isScheduling {
  top: -33px !important;
}

.Sidebar-wrapper.enableSidebarScroll {
  overflow: auto;
}

.Sidebar-wrapper.desktop {
  padding: 0 14px;
}

.comp-wrapper {
  overflow: visible;
}

.header {
  width: 100%;
  height: 30px;
  margin: 14px 0;
  display: flex;
  border-bottom: .5px solid var(--light-gray);
  position: relative;
}

.back-layer {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  transition-duration: .3s;
}

.back-layer.showing {
  background-color: var(--sidebar-color);
}

.line {
  position: absolute;
  left: 0;
  bottom: -1px;
  background-color: var(--primary);
  width: 100px;
  height: 2px;
  transition-duration: .15s;
}

.pressingHandle {
  transition-duration: 0s !important;
  transition: none !important;
}

.option {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .15s;
  cursor: pointer;
  font-size: 1.05em;
  color: var(--fade);
  outline: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  overflow: hidden;
  position: relative;
}

.option:hover {
  color: var(--txt);
  background-color: var(--card);
}

.option:active {
  background-color: var(--light-gray);
}

.sectionActive {
  color: var(--primary) !important;
}

.bar-trans-enter, .bar-trans-leave-to {
  transform: translateX(-30px);
  opacity: 0;
  transition: transform .4s, opacity .4s;
}

.bar-trans-leave, .bar-trans-enter-to {
  transform: translateX(0px);
  opacity: 1;
  transition: transform .4s, opacity .4s;
}

.slim-sidebar {
  padding: 0 !important;
}

.slim-sidebar .extra-margin {
  display: none;
}

.slim-sidebar .margin-wrapper {
  padding: 26px;
  padding-bottom: 0;
  height: 90%;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--card);
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(10,10,10,.3);
}

.smart-items {
  font-family: "Open Sans Bold";
}

.bar-trans-enter-to {
  transition-delay: .4s;
}

.component {
  transform: translateX(0px);
  opacity: 1;
  overflow: visible;
}

.to-right {
  transform: translateX(75px);
  opacity: 0;
}

.to-left {
  transform: translateX(-75px);
  opacity: 0;
}

.sect-trans-enter-active, .sect-trans-leave-active {
  width: 100%;
  position: absolute;
}

.icon-t-enter, .icon-t-leave-to {
  opacity: 0 !important;
  transition-duration: .15s !important;
}

.icon-t-leave, .icon-t-enter-to {
  opacity: 1 !important;
  transition-duration: .15s !important;
}

.search-t-enter, .search-t-leave-to {
  opacity: 0;
  height: 0;
  transition: height .3s, opacity .3s;
}

.search-t-leave, .search-t-enter-to {
  opacity: 1;
  height: 35px;
  transition: height .3s, opacity .3s;
}

.mr-enter-active, .mr-leave-active, .ml-enter-active, .ml-leave-active {
  transition-duration: .3s;
  position: absolute;
  width: 100%;
}

.mr-enter, .ml-leave {
  transform: translateX(100px);
  opacity: 0;
}

.mr-enter-to, .mr-leave, .ml-enter, .ml-leave-to {
  transform: translateX(0);
  opacity: 1;
}

.mr-leave, .ml-enter {
  transform: translateX(-100px);
  opacity: 0;
}

</style>
