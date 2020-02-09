<template>
  <div class="Sidebar-wrapper"
    :class="[platform, {'scroll-thin': isDesktop}]"

    @mouseenter="sidebarHover = true"
    @mouseleave="sidebarHover = false"
  >
    <div class="margin-wrapper">
      <div v-if="isDesktop"
        class="back-layer"
        :class="{showing, pressingHandle}"
        :style="{width}"
      ></div>
      <div class="inner-wrapper">
        <div>
          <div class="search-shadow" @mouseenter="showSearch" @mouseleave="hideSearch"></div>
          <transition name="bar-trans">
          <div v-if="!isDesktop || showing" class="sidebar-content">
            <transition name="search-t">
              <SearchButton v-if="showingSearch && isDesktop"
                @click="$store.dispatch('pushPopup', {comp: 'FastSearch', naked: true})"
                @mouseenter="showSearch"
                @mouseleave="hideSearch"
              />
            </transition>
              <SidebarRenderer
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
              <div v-if='showFavorites' style="margin-top: 28px"></div>
              <SidebarRenderer v-if="showFavorites"
                :enableSort='true'
                :disabled='false'
                :disableSelection='true'
                :list='getFavoritesRenderList'
                :active='value'
                :viewType='viewType'
                :isSmart='false'

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
                  <CircleBubble
                    innerColor='var(--light-gray)'
                    outerColor='var(--fade)'
                    opacity='0'
                  />
                </div>
                <div class="line section-line"></div>
              </div>
              <div v-else style="margin-top: 28px"></div>
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
              <div style="height: 300px"></div>
            </div>
          </transition>
        </div>
        <div v-if="isDesktop" style="height: 35px;"></div>
        <div class="footer" :class="[platform, {showing}]" :style="{width}">
          <div class="inner-footer">
            <div class="drop" v-if="showIconDropdown">
              <Icon v-for="i in sideIcons" :key='i.icon'
                class="sect-icon passive cursor remove-highlight primary-hover"
                :icon='i.icon'
                :circle='true'
                :number='i.number'
                color='var(--fade)'
                @click="i.callback"
              />
              <transition name="icon-t">
                <IconDrop
                  class="right passive"
                  handle='settings-h'
                  :circle='true'
                  handleColor='var(--fade)'
                  :options="getSectionOptions"
                />
              </transition>
            </div>
            <div></div>
            <Icon v-if="isDesktop" icon="arrow" id='sidebar-arrow' class="cursor passive" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true" :circle='true'  @click="toggleSidebar"/>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isDesktop && !sidebarHided"
      class="sidebar-handle passive"
      :class="{sidebarHover}"
      :style="sidebarHandle"

      @pointerdown='pointerdown'
    ></div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import SidebarElementVue from './SidebarElement.vue'
import ListsVue from './Sections/Lists.vue'
import FiltersVue from './Sections/Filters.vue'
import TagsVue from './Sections/Tags.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import RendererVue from './Renderer.vue'
import SearchButtonVue from './SearchButton.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils'
import utilsList from '@/utils/list'
import utilsTag from '@/utils/tag'
import utilsFolder from '@/utils/folder'

export default {
  props: ['value', 'width', 'sidebarHided', 'pressingHandle'],
  components: {
    Icon: IconVue,
    SidebarElement: SidebarElementVue,
    IconDrop: IconDropVue,
    Lists: ListsVue,
    Tags: TagsVue,
    Filters: FiltersVue,
    SidebarRenderer: RendererVue,
    SearchButton: SearchButtonVue,
  },
  data() {
    const links = [
          {
            name: 'Today',
            icon: 'star',
            iconColor: 'var(--yellow)',
          },
          {
            name: 'Tomorrow',
            id: 'Tomorrow',
            icon: 'sun',
            iconColor: 'var(--orange)',
          },
          {
            name: 'Inbox',
            icon: 'inbox',
            disableAction: true,
            iconColor: 'var(--primary)',
          },
          {
            name: 'Upcoming',
            icon: 'calendar',
            disableAction: true,
            iconColor: 'var(--green)'
          },
          {
            name: 'Anytime',
            icon: 'layer-group',
            disableAction: true,
            iconColor: 'var(--dark-blue)',
          },
          {
            name: 'Someday',
            icon: 'archive',
            iconColor: 'var(--brown)'
          },
          {
            name: 'Pomodoro',
            icon: 'pomo',
            disableAction: true,
            iconColor: 'var(--dark-red)',
          },
          {
            name: 'Calendar',
            icon: 'calendar-star',
            disableAction: true,
            iconColor: 'var(--purple)'
          },
          {
            name: 'Completed',
            icon: 'circle-check',
            iconColor: 'var(--olive)'
          },
          {
            name: 'Statistics',
            icon: 'pie',
            iconColor: 'var(--primary)'
          },
        ]

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
    const saved = localStorage.getItem('section')
    if (saved) this.section = saved

    if (this.isSingleSection)
      this.section = this.notHidedSections[0].name
  },
  mounted() {
    setInterval(() => {
      this.moveLineToActive()
    }, 200)
    this.moveLineToActive()
    window.addEventListener('resize', this.moveLineToActive)

/*     let oldData = JSON.parse(JSON.stringify(this.$data));
    this.$watch(vm => vm.$data, (newData) => {
      console.log(3)
      console.log(DeepDiff.diff(oldData, newData));
      oldData = JSON.parse(JSON.stringify(newData));
    }, {
      deep: true
    }); */
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.moveLineToActive)
  },
  methods: {
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
    applySelectedTasks({elId, tasks}) {
/*       this.$store.dispatch('task/handleTasksBySidebarElementDragAndDrop', {
        elIds: [elId],
        taskIds: tasks,
        type: elId,
      }) */
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
    toggleSidebar() {
      this.$emit('sidebar')
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
      if (viewName !== 'Today')
        return {total: obj.total}
      return obj
    },
    mapProgress(link) {
      if (link.type === 'list')
        return this.$store.getters['list/pieProgress'](this.tasks, link.id, task => this.isTaskInView(task, "Completed"))
      return null
    },
    mapFavorites(link) {
      if (link.type === 'tag')
        return {
          total: this.getNumberOfTasksByTag({tagId: link.id, tags: this.tags}).total,
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
    }),
    ...mapGetters({
      tags: 'tag/tags',
      tasks: 'task/tasks',
      platform: 'platform',
      isStandAlone: 'isStandAlone',
      isDesktop: 'isDesktop',
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      getNumberOfTasksByView: 'task/getNumberOfTasksByView',
      favLists: 'list/getFavoriteLists',
      sortedFromMeInvites: 'invites/sortedFromMeInvites',
      sortedToMeInvites: 'invites/sortedToMeInvites',
      isTaskInView: 'task/isTaskInView',
      // getfavfilters
      isTaskCompleted: 'task/isTaskCompleted',
      favFolders: 'folder/getFavoriteFolders',
      favTags: 'tag/getFavoriteTags',
    }),
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
            return utilsList.listOptions(link)
          }
          case 'tag': {
            return utilsTag.tagOptions(link)
          }
          case 'folder': {
            return utilsFolder.getFolderOptions(link)
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
        ...this.favTags
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
      return ['Today', 'Tomorrow', 'Inbox', 'Upcoming', 'Anytime', 'Someday', 'Pomodoro', 'Calendar', 'Completed', 'Completed']
    },
    getLinksOrdered() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.linksOrder, this.nonHidedLinks)
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
      const arr = [
        {
          name: 'Import from template',
          icon: 'import',
          file: true,
          accept: '.json',
          handleFiles: (files, promise) => {
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
        {
          name: 'Sort lists by name',
          icon: 'sort-name',
          callback: () => dispatch('list/sortListsByName'),
        },
        {
          name: 'Add folder',
          icon: 'folder',
          callback: () => dispatch('pushPopup', {comp: 'AddFolder', naked: true}),
        },
        {
          name: 'Add group',
          icon: 'group',
          callback: () => dispatch('pushPopup', {comp: 'AddGroup', naked: true}),
        },
        {
          name: 'Add list',
          icon: 'tasks',
          callback: () => dispatch('pushPopup', {comp: 'AddList', naked: true}),
        },
      ]
      return arr
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

.search-shadow {
  z-index: 100;
  top: -35px;
  width: 100%;
  position: absolute;
  height: 35px;
}

.sidebar-handle {
  position: fixed;
  background-color: var(--card);
  width: 8px;
  height: 145px;
  top: 50%;
  border-radius: 100px;
  transform: translateY(-50%);
  z-index: 1000px;
  cursor: pointer;
  opacity: 0 !important;
  transition: opacity .2s, background-color .2s, width .2s, transform .2s;
}

.sidebar-handle.sidebarHover {
  opacity: 1 !important;
}

.sidebar-handle:hover {
  cursor: grab;
  background-color: var(--light-gray);
  width: 14px;
  transform: translate(-6px, -50%);
}

.sidebar-handle:active {
  cursor: grabbing;
}

.sidebar-content {
  position: relative;
}

.Sidebar {
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
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
}

.Sidebar-wrapper.desktop::-webkit-scrollbar {
  display: none;
}

.Sidebar-wrapper.desktop {
  padding: 0 30px;
}

.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 40px;
  border: none;
  padding: 0 25px;
}

.footer.mobile {
  bottom: 15px;
  height: 53px;
  width: 100%;
  margin-left: 0;
  padding: 0;
}

.mobile .inner-footer {
  box-shadow: 0 -3px 4px var(--dark);
}

.comp-wrapper {
  overflow: visible;
}

.header {
  width: 100%;
  height: 42px;
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
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
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

#sidebar-arrow {
  position: absolute;
  left: 3px;
  transform: translateY(5px) rotate(90deg);
  transition: opacity .3s, left .3s, transform .3s;
}

#sidebar-arrow.hided {
  transform: translateY(5px) rotate(-90deg);
}

.inner-footer {
  position: relative;
  background-color: none;
  box-shadow: none;
  transition-duration: 0;
  height: 100%;
}

.showing .inner-footer {
  background-color: var(--sidebar-color);
  box-shadow: 0 -3px 4px var(--sidebar-color);
}

.sect-icon {
  margin-right: 12px;
}

.mobile .showing .inner-footer {
  background-color: var(--back-color);
  box-shadow: 0 -3px 4px var(--back-color);
}

.drop {
  position: absolute;
  right: 17px;
  display: flex;
  transform: translate(16px, 10px);
}

.footer.mobile .drop {
  right: unset;
  bottom: 24px;
}

.mobile .drop {
  right: unset;
  left: 0;
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

.bar-trans-enter-to {
  transition-delay: .6s;
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

</style>
