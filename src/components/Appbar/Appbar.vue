<template>
  <div class="Appbar-wrapper scroll-thin" :class="platform">
    <div class="Appbar" :class='platform'>
      <div class="inner-wrapper">
        <div>
          <transition name="bar-trans">
            <div v-if="showing" class="content">
              <AppnavRenderer
                type='list'
                :enableSort='false'
                :disabled='!isDesktop'
                :disableSelection='true'
                :list='links'
                :active='value'
                :viewType='viewType'
                :onTaskDrop='onTaskDrop'
                :mapNumbers='numberOfTasks'
                :isSmart='true'
                @apply='applySelectedTasks'
              />
              <div class="header">
                <div v-for="(s,i) in sections" :key="s.name"
                  class="option section-option"
                  :class="{sectionActive: s.name === section}"
                  :tabindex="i + 1 + links.length"
                  @click="moveLine(i)"
                  :data-section="s.name"
                >{{ l[s.name] }}</div>
                <div class="line section-line"></div>
              </div>
              <div class="comp-wrapper">
                <transition name="sect-trans"
                  @leave="leave"
                  @enter="enter"
                >
                  <component
                    class="component appnav-section"
                    :is="section"
                    :active="value"
                    :viewType='viewType'
                    :data-transindex="getAppnavIndex(section)"
                  />
                </transition>
              </div>
            </div>
          </transition>
        </div>
        <div v-if="isDesktop" style="height: 35px;"></div>
        <div class="footer" :class="platform">
          <div class="inner-footer">
            <transition name="icon-t">
              <IconDrop v-if="showIconDropdown"
                class="drop right passive"
                handle='settings-h'
                handleColor='var(--gray)'
                :options="getSectionOptions"
              />
            </transition>
            <Icon v-if="isDesktop" icon="arrow" id='appbar-arrow' class="cursor passive" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true" @click="toggleAppbar"/>
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
import IconDropVue from '../IconDrop.vue'
import RendererVue from './Renderer.vue'

import { mapGetters, mapState } from 'vuex'

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
  },
  data() {
    return {
      links: [
        {
          name: 'Today',
          id: 'Today',
          icon: 'star',
          callback: () => this.$router.push('/user?list=Today'),
          iconColor: 'var(--yellow)',
        },
        {
          name: 'Tomorrow',
          id: 'Tomorrow',
          icon: 'sun',
          callback: () => this.$router.push('/user?list=Tomorrow'),
          iconColor: 'var(--orange)',
        },
        {
          name: 'Inbox',
          id: 'Inbox',
          icon: 'inbox',
          disableAction: true,
          callback: () => this.$router.push('/user?list=Inbox'),
          iconColor: 'var(--primary)',
        },
        {
          name: 'Upcoming',
          id: 'Upcoming',
          icon: 'calendar',
          disableAction: true,
          callback: () => this.$router.push('/user?list=Upcoming'),
          iconColor: 'var(--green)'
        },
        {
          name: 'Completed',
          id: 'Completed',
          icon: 'circle-check',
          callback: () => this.$router.push('/user?list=Completed'),
          iconColor: 'var(--brown)'
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
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.moveLineToActive)
  },
  methods: {
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
        el.style.transitionDuration = '.2s'
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
      if (viewName === 'Upcoming')
        return {
          total: 0,
          notCompleted: 0,
        }
      const obj = this.getNumberOfTasksByView(viewName)
      if (viewName !== 'Today')
        return {total: obj.total}
      return obj
    },
  },
  computed: {
    ...mapState(['selectedTasks']),
    ...mapGetters({
      platform: 'platform',
      isStandAlone: 'isStandAlone',
      isDesktop: 'isDesktop',
      l: 'l',
      getNumberOfTasksByView: 'task/getNumberOfTasksByView'
    }),
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
          name: this.l['Sort tags'],
          icon: 'sort',
          callback: () => [
            {
              name: this.l['Sort tags by name'],
              icon: 'sort-name',
              callback: () => dispatch('tag/sortTagsByName')
            },
            {
              name: this.l['Sort tags by frequency'],
              icon: 'fire',
              callback: () => dispatch('tag/sortTagsByFrequency')
            }
          ]
        },
        {
          name: this.l['Add tag'],
          icon: 'tag',
          callback: () => dispatch('pushPopup', {comp: 'AddTag'})
        }
      ]
    },
    Lists() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: this.l['Add list'],
          icon: 'tasks',
          callback: () => dispatch('pushPopup', {comp: 'AddList'}),
        },
        {
          name: this.l['Sort lists by name'],
          icon: 'sort-name',
          callback: () => dispatch('list/sortListsByName'),
        }
      ]
    },
    Filters() {
      const dispatch = this.$store.dispatch
      return [
        {
          name: 'Add filter',
          icon: 'filter',
          callback: () => dispatch('pushPopup', {comp: 'AddFilter'}),
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

.content {
  position: relative;
}

.Appbar {
  height: 100%;
  width: 100%;
  padding-right: 25px;
  overflow: visible;
}

.Appbar-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.Appbar-wrapper.desktop {
  left: -35px;
  padding-left: 35px;
}

.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 35px;
  width: 100%;
  background-color: var(--back-color);
  border: none;
  margin-left: 32px;
  box-shadow: 0 -3px 4px var(--back-color);
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

.line {
  position: absolute;
  left: 0;
  bottom: -1px;
  background-color: var(--primary);
  width: 100px;
  height: 2px;
  transition-duration: .2s;
}

.option {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition-duration: .2s;
  cursor: pointer;
  color: var(--gray);
  outline: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.option:hover {
  color: var(--white);
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
  transform: translateY(13px);
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
  transition-duration: .2s !important;
}

.icon-t-leave, .icon-t-enter-to {
  opacity: 1 !important;
  transition-duration: .2s !important;
}

</style>
