<template>
  <div class="Appbar" :class='platform'>
    <transition name="bar-trans">
      <div v-if="showing" class="content">
        <AppbarElement v-for="(l, i) in links" :key="l.name"
          type='list'
          :name='l.name'
          :active="value"
          :isSmart='true'
          :viewType="viewType"
          :icon='l.icon'
          :callback='l.callback'
          :iconColor='l.iconColor'
          :tabindex="i + 1"
          :totalNumber='numberOfTasks(l.name).total'
          :importantNumber='numberOfTasks(l.name).notCompleted'
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
        <transition name="sect-trans"
          @leave="leave"
          @enter="enter"
        >
          <keep-alive>
            <component
              class="component"
              :is="section"
              :active="value"
              :viewType='viewType'
              :data-transindex="getAppnavIndex(section)"
            />
          </keep-alive>
        </transition>
      </div>
    </transition>
      <IconDrop v-if="getSectionOptions && !appbarHided"
      class="drop right passive"
      handle='settings-h'
      handleColor='var(--gray)'
      :options="getSectionOptions"
    />
    <Icon v-if="$store.getters.isDesktop" icon="arrow" id='appbar-arrow' class="cursor passive" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true" @click="toggleAppbar"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import AppbarElementVue from './AppbarElement.vue'
import ListsVue from './Sections/Lists.vue'
import TagsVue from './Sections/Tags.vue'
import FiltersVue from './Sections/Filters.vue'
import IconDropVue from '../IconDrop.vue'
import { mapGetters } from 'vuex'

export default {
  props: ['value', 'viewType', 'appbarHided'],
  components: {
    Icon: IconVue,
    AppbarElement: AppbarElementVue,
    IconDrop: IconDropVue,
    Lists: ListsVue,
    Tags: TagsVue,
    Filters: FiltersVue,
  },
  data() {
    return {
      links: [
        {
          name: 'Today',
          icon: 'star',
          callback: () => this.$router.push('/user?list=Today'),
          iconColor: 'var(--yellow)',
        },
        {
          name: 'Tomorrow',
          icon: 'sun',
          callback: () => this.$router.push('/user?list=Tomorrow'),
          iconColor: 'var(--orange)',
        },
        {
          name: 'Inbox',
          icon: 'inbox',
          callback: () => this.$router.push('/user?list=Inbox'),
          iconColor: 'var(--primary)',
        },
        {
          name: 'Upcoming',
          icon: 'calendar',
          callback: () => this.$router.push('/user?list=Upcoming'),
          iconColor: 'var(--green)'
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
      const el = this.$el.getElementsByClassName('sectionActive')[0]
      const line = this.$el.getElementsByClassName('line')[0]

      if (el && line) {
        line.style.left = el.offsetLeft + 'px'
        line.style.width = el.offsetWidth + 'px'
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
    numberOfTasks(viewName) {
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
    ...mapGetters({
      platform: 'platform',
      l: 'l',
      getNumberOfTasksByView: 'task/getNumberOfTasksByView'
    }),
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
    },
  }
}

</script>

<style scoped>

.content {
  position: relative;
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
  position: fixed;
  left: 70px;
  bottom: 16px;
  transition: opacity .3s, left .3s, transform .3s;
  transform: rotate(90deg);
}

#appbar-arrow.hided {
  transform: rotate(-90deg);
  left: 30px;
}

.drop {
  position: fixed;
  left: 310px;
  bottom: 16px;
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

</style>
