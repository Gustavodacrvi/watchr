<template>
  <div class="Appbar-wrapper scroll-thin" :class="platform">
    <div class="margin-wrapper">
      <div v-if="isDesktop" class="back-layer" :class="{showing}"></div>
      <div class="Appbar" :class='platform'>
    </div>
      <div class="inner-wrapper">
        <div>
          <div class="search-shadow" @mouseenter="showSearch" @mouseleave="hideSearch"></div>
          <transition name="bar-trans">
          <div v-if="showing" class="appbar-content">
            <transition name="search-t">
              <SearchButton v-if="showingSearch || !isDesktop"
                @click="$store.commit('openFastSearch')"
                @mouseenter="showSearch"
                @mouseleave="hideSearch"
              />
            </transition>
              <AppnavRenderer
                type='list'
                :enableSort='true'
                :disabled='false'
                :disableSelection='true'
                :list='getLinksOrdered'
                :active='value'
                :onTaskDrop='onTaskDrop'
                :viewType='viewType'
                :isSmart='true'

                :mapNumbers='numberOfTasks'
                @update='update'
                @apply='applySelectedTasks'
              />
              <div v-if='showFavorites' style="margin-top: 28px"></div>
              <AppnavRenderer v-if="showFavorites"
                type='favorite'
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
                >{{ l[s.name] }}</div>
                <div class="line section-line"></div>
              </div>
              <div v-else style="margin-top: 28px"></div>
              <div class="comp-wrapper">
                <transition name="sect-trans"
                  @leave="leave"
                  @enter="enter"
                >
                  <component
                    class="component appnav-section floating-btn-container"
                    :is="section"
                    :active="value"
                    :viewType='viewType'
                    :showDefered='showDefered'
                    :showRepeat='showRepeat'
                    :data-transindex="getAppnavIndex(section)"
                  />
                </transition>
              </div>
              <div v-if="!isDesktop" style="height: 300px"></div>
            </div>
          </transition>
        </div>
        <div v-if="isDesktop" style="height: 35px;"></div>
        <div class="footer" :class="[platform, {showing}]">
          <div class="inner-footer">
            <div class="drop">
              <transition name="icon-t">
                <IconDrop v-if="showIconDropdown"
                  class="right passive"
                  handle='settings-h'
                  :circle='true'
                  handleColor='var(--gray)'
                  :options="getOptions"
                />
              </transition>
            </div>
            <div></div>
            <Icon v-if="isDesktop" icon="arrow" id='appbar-arrow' class="cursor passive" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true" :circle='true'  @click="toggleAppbar"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import AppbarElementVue from './AppbarElement.vue'
import ListsVue from './Sections/Lists.vue'
import TagsVue from './Sections/Tags.vue'
import FiltersVue from './Sections/Filters.vue'
import IconDropVue from '../IconDrop/IconDrop.vue'
import RendererVue from './Renderer.vue'
import SearchButtonVue from './SearchButton.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils'
import utilsList from '@/utils/list'
import utilsTag from '@/utils/tag'
import utilsFolder from '@/utils/folder'
import { userRef } from '@/utils/firestore'

export default {
  props: ['value', 'viewType', 'appbarHided'],
  components: {
    Icon: IconVue,
    AppbarElement: AppbarElementVue,
    IconDrop: IconDropVue,
    Lists: ListsVue,
    Tags: TagsVue,
    Filters: FiltersVue,
    AppnavRenderer: RendererVue,
    SearchButton: SearchButtonVue,
  },
  data() {
    const selectView = str => {
      this.$router.push(`/user?list=${str}`)
    }
    
    return {
      links: [
        {
          name: 'Today',
          id: 'Today',
          icon: 'star',
          callback: () => selectView('Today'),
          iconColor: 'var(--yellow)',
        },
        {
          name: 'Tomorrow',
          id: 'Tomorrow',
          icon: 'sun',
          callback: () => selectView('Tomorrow'),
          iconColor: 'var(--orange)',
        },
        {
          name: 'Someday',
          id: 'Someday',
          icon: 'archive',
          callback: () => selectView('Someday'),
          iconColor: 'var(--brown)'
        },
        {
          name: 'Inbox',
          id: 'Inbox',
          icon: 'inbox',
          disableAction: true,
          callback: () => selectView('Inbox'),
          iconColor: 'var(--primary)',
        },
        {
          name: 'Upcoming',
          id: 'Upcoming',
          icon: 'calendar',
          disableAction: true,
          callback: () => selectView('Upcoming'),
          iconColor: 'var(--green)'
        },
        {
          name: 'Completed',
          id: 'Completed',
          icon: 'circle-check',
          callback: () => selectView('Completed'),
          iconColor: 'var(--olive)'
        },
      ],
      sections: [
        {
          name: 'Lists',
        },
        /*         {
          name: 'Filters',
        }, */
        {
          name: 'Tags',
        },
      ],
      showing: true,
      transRight: true,
      showingIconDrop: true,
      showingSearch: false,
      showDefered: false,
      showRepeat: false,
      searchTimeout: null,
      oldIndex: 0,
      section: 'Lists'
    }
  },
  created() {
    const saved = localStorage.getItem('section')
    if (saved) this.section = saved
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
    update(links) {
      userRef(this.userInfo.userId).set({
        links,
      }, {merge: true})
    },
    updateFavorites(favorites) {
      userRef(this.userInfo.userId).set({
        favorites,
      }, {merge: true})
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
    applySelectedTasks(elId) {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
        elIds: [elId],
        taskIds: this.selectedTasks,
        type: elId,
      })
    },
    onTaskDrop({taskId, elId}) {
      this.$store.dispatch('task/handleTasksByAppnavElementDragAndDrop', {
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
      setTimeout(() => {
        el.style.transitionDuration = '.15s'
        el.classList.remove('to-right')
        el.classList.remove('to-left')
      })

      this.oldIndex = this.newIndex
    },
    getAppnavIndex(name) {
      const obj = {
        Lists: 1,
        Filters: 2,
        Tags: 3,
      }
      return obj[name]
    },
    toggleAppbar() {
      this.showing = !this.showing
      this.$emit('appbar', !this.showing)
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
      if (viewName === 'Upcoming' || viewName === 'Someday')
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
        return this.$store.getters['list/pieProgress'](this.tasks, link.id, this.isTaskCompleted)
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
      }
    },
  },
  computed: {
    ...mapState({
      selectedTasks: state => state.selectedTasks,
      userInfo: state => state.userInfo,
      tasks: state => state.task.tasks,
    }),
    ...mapGetters({
      platform: 'platform',
      isStandAlone: 'isStandAlone',
      isDesktop: 'isDesktop',
      l: 'l',
      getNumberOfTasksByTag: 'task/getNumberOfTasksByTag',
      getNumberOfTasksByView: 'task/getNumberOfTasksByView',
      favLists: 'list/getFavoriteLists',
      isTaskCompleted: 'task/isTaskCompleted',
      favFolders: 'folder/getFavoriteFolders',
      favTags: 'tag/getFavoriteTags',
    }),
    getFavoritesRenderList() {
      const favs = this.getFavorites

      const selectView = (name, type) => {
        this.$store.commit('navigate', name)
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
      return ['Today', 'Tomorrow', 'Someday', 'Inbox', 'Upcoming', 'Completed']
    },
    getLinksOrdered() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.linksOrder, this.links)
    },
    getOptions() {
      const opt = this.getSectionOptions.slice()

      if (this.hidedSections.length > 0) {
        opt.push({type: 'hr', name: 'division'})
        const sect = [...this.hidedSections.filter(el => el !== this.section)]
        if (this.isSingleSection && this.notHidedSections[0].name !== this.section)
          sect.unshift(this.notHidedSections[0].name)
        for (const s of sect) {
          opt.push({
            name: s,
            icon: this.getIconByType(s),
            callback: () => {this.section = s}
          })
        }
      }

      return opt.slice()
    },
    hidedSections() {
      if (this.userInfo && this.userInfo.hidedSections) return this.userInfo.hidedSections
      return []
    },
    notHidedSections() {
      return this.sections.filter(s => !this.hidedSections.includes(s.name))
    },
    isSingleSection() {
      return this.notHidedSections.length === 1
    },
    showIconDropdown() {
      return this.getSectionOptions && !this.appbarHided && this.showingIconDrop
    },
    getSectionOptions() {
      return this[this.section]
    },
    Tags() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: this.l['Sort tags by name'],
          icon: 'sort-name',
          callback: () => dispatch('tag/sortTagsByName')
        },
        {
          name: this.l['Add tag'],
          icon: 'tag',
          callback: () => dispatch('pushPopup', {comp: 'AddTag', naked: true})
        }
      ]
    },
    Lists() {
      const dispatch = this.$store.dispatch
      const arr = [
        {
          name: this.l['Sort lists by name'],
          icon: 'sort-name',
          callback: () => dispatch('list/sortListsByName'),
        },
        {
          name: this.l['Add folder'],
          icon: 'folder',
          callback: () => dispatch('pushPopup', {comp: 'AddFolder', naked: true}),
        },
        {
          name: this.l['Add list'],
          icon: 'tasks',
          callback: () => dispatch('pushPopup', {comp: 'AddList', naked: true}),
        },
      ]
      if (this.isDesktop) {
        arr.splice(1, 0, {
          name: this.l['Import from template'],
          icon: 'import',
          file: true,
          accept: '.json',
          handleFiles: (files, promise) => {
            const bug = () => {
              this.$store.commit('pushToast', {
                name: this.l["An error ocurred while importing the JSON file, the file is corrupted."],
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
        },)
      }
      const inner = []
      if (!this.showDefered) {
        inner.unshift({
          name: this.l["Show defered lists"],
          icon: 'sleep',
          callback: () => this.showDefered = true
        })
      } else {
        inner.unshift({
          name: this.l['Hide defered lists'],
          icon: 'tasks',
          callback: () => this.showDefered = false
        })
      }
      if (!this.showRepeat) {
        inner.unshift({
          name: this.l['Show periodic lists'],
          icon: 'repeat',
          callback: () => this.showRepeat = true
        })
      } else {
        inner.unshift({
          name: this.l['Hide periodic lists'],
          icon: 'repeat',
          callback: () => this.showRepeat = false
        })
      }
      if (inner.length > 0) {
        arr.push({
          name: this.l['More options'],
          icon: 'settings-h',
          callback: () => inner,
        })
      }
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
          name: 'Sort lists by name',
          icon: 'sort-name',
          callback: () => dispatch('list/sortFiltersByName'),
        }
      ]
    },
    newIndex() {
      return this.getAppnavIndex(this.section)
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

.appbar-content {
  position: relative;
}

.Appbar {
  height: 100%;
  padding-right: 25px;
  overflow: visible;
}

.mobile .margin-wrapper {
  margin: 16px;
  margin-top: 0;
}

.Appbar.mobile {
  padding-right: 0;
}

.Appbar-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.Appbar-wrapper.desktop {
  padding-left: 22px;
}

.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 40px;
  width: 338px;
  background-color: var(--back-color);
  border: none;
  margin-left: 32px;
  box-shadow: 0 -3px 4px var(--back-color);
}

.footer.showing.desktop {
  background-color: var(--appnav-color);
  box-shadow: 0 -3px 4px var(--appnav-color);
}

.footer.mobile {
  bottom: 15px;
  height: 53px;
  width: 100%;
  margin-left: 0;
  background-color: var(--dark);
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
  width: 450px;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
  transition-duration: .3s;
}

.back-layer.showing {
  background-color: var(--appnav-color);
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

.option {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .15s;
  cursor: pointer;
  color: var(--gray);
  outline: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.option:hover {
  color: var(--white);
  background-color: var(--light-gray);
}

.option:active {
  background-color: var(--card);
}

.sectionActive {
  color: var(--primary) !important;
}

#appbar-arrow {
  position: absolute;
  left: 3px;
  transform: translateY(5px) rotate(90deg);
  transition: opacity .3s, left .3s, transform .3s;
}

#appbar-arrow.hided {
  transform: translateY(5px) rotate(-90deg);
  left: -30px;
}

.inner-footer {
  position: relative;
  height: 100%;
}

.drop {
  position: absolute;
  right: 0;
  display: flex;
  transform: translate(16px, 10px);
}

.mobile .drop {
  transform: translate(-8px, 10px);
}

.footer.mobile .drop {
  right: 0;
  bottom: 24px;
}

.mobile .drop {
  left: unset;
  right: 7px;
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
