<template>
  <div class="Appbar">
    <AppbarElement v-for="(l, i) in links" :key="l.name"
      :name='l.name'
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
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import AppbarElementVue from './AppbarElement.vue'

export default {
  components: {
    Icon: IconVue,
    AppbarElement: AppbarElementVue,
  },
  data() {
    return {
      links: [
        {
          name: 'Today',
          icon: 'star',
          callback: () => console.log('today'),
          iconColor: 'var(--yellow)',
        },
        {
          name: 'Tomorrow',
          icon: 'sun',
          callback: () => console.log('tomorrow'),
          iconColor: 'var(--orange)',
        },
        {
          name: 'Inbox',
          icon: 'inbox',
          callback: () => console.log('inbox'),
          iconColor: 'var(--primary)',
        },
        {
          name: 'Upcoming',
          icon: 'calendar',
          callback: () => console.log('calendar'),
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
      section: 'Lists'
    }
  },
  mounted() {
    const el = this.$el.getElementsByClassName('sectionActive')[0]
    const line = this.$el.getElementsByClassName('line')[0]

    line.style.left = el.offsetLeft + 'px'
    line.style.width = el.offsetWidth + 'px'
  },
  methods: {
    moveLine(i) {
      const el = this.$el.getElementsByClassName('section-option')[i]
      const line = this.$el.getElementsByClassName('section-line')[0]

      line.style.left = el.offsetLeft + 'px'
      line.style.width = el.offsetWidth + 'px'

      this.section = el.textContent
    },
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
  outline: none;
}

.option:hover {
  background-color: var(--light-gray);
}

.sectionActive {
  color: var(--primary);
}

</style>
