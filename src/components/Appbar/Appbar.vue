<template>
  <div class="Appbar">
    <transition name="bar-trans">
      <div v-if="showing" class="content">
        <AppbarElement v-for="(l, i) in links" :key="l.name"
          :name='l.name'
          :active="value"
          :icon='l.icon'
          :callback='l.callback'
          :icon-color='l.iconColor'
          :tabindex="i + 1"
        />
        <div class="header">
          <div v-for="(s,i) in sections" :key="s.name"
            class="option section-option rb"
            :class="{sectionActive: s.name === section}"
            :tabindex="i + 1 + links.length"
            @click="moveLine(i)"
          >{{ s.name }}</div>
          <div class="line section-line"></div>
        </div>
        <transition name="sect-trans"
          @leave="leave"
          @enter="enter"
        >
          <component :is="section" :data-transindex="getAppnavIndex(section)"/>
        </transition>
      </div>
    </transition>
    <Icon icon="arrow" class="arrow cursor" :class="{hided: !showing}" color="var(--light-gray)" :primary-hover="true" @click="toggleAppbar"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import AppbarElementVue from './AppbarElement.vue'
import ListsVue from './Sections/Lists.vue'
import TagsVue from './Sections/Tags.vue'
import FiltersVue from './Sections/Filters.vue'

export default {
  props: ['value', 'viewType'],
  components: {
    Icon: IconVue,
    AppbarElement: AppbarElementVue,
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
        {
          name: 'Filters',
        },
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
  mounted() {
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
        el.style.transform = 'translateX(0px)'
      } else {
        el.style.transform = 'translateX(-50px)'
      }
      setTimeout(() => {
        if (this.transRight) {
          el.style.transform = 'translateX(-50px)'
        } else {
          el.style.transform = 'translateX(0px)'
        }
      })
    },
    enter(el) {
      if (this.transRight) {
        el.style.transform = 'translateX(50px)'
      } else {
        el.style.transform = 'translateX(-50px)'
      }
      setTimeout(() => {
        if (this.transRight) {
          el.style.transform = 'translateX(0px)'
        } else {
          el.style.transform = 'translateX(0px)'
        }
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
  
        this.section = el.textContent
      }
    },
  },
  computed: {
    newIndex() {
      return this.getAppnavIndex(this.section)
    }
  }
}

</script>

<style scoped>

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
}

.option:hover {
  background-color: var(--light-gray);
  color: var(--white);
}

.sectionActive {
  color: var(--primary);
}

.arrow {
  position: absolute;
  left: 60px;
  bottom: 10px;
  transition: color .2s, transform .4s, left .4s;
  transform: rotate(90deg);
}

.arrow.hided {
  transform: rotate(-90deg);
  left: 15px;
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

.sect-trans-enter, .sect-trans-leave-to {
  transition-duration: .2s;
  opacity: 0;
  position: absolute;
}

.sect-trans-leave, .sect-trans-enter-to {
  transition-duration: .2s;
  opacity: 1;
  position: absolute;
}

</style>
