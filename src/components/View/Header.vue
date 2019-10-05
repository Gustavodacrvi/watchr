<template>
  <div class="Header" @click='click'>
    <div v-if="$store.getters.isDesktop" class="header">
      <Icon class="icon" :icon="getIcon" :color="getIconColor" width="40px"/>
      <h2 class="name">{{ viewNameValue }}</h2>
      <IconDrop class="passive" handle="settings-h" handleColor="var(--gray)" :options="options"/>
    </div>
    <div class="tags" :class="{margins: tags.length > 0}">
      <Tag class="tag" v-for="t in tags" :key="t.id"
        :value="t.name"
        :selected='activeTags.includes(t.name)'
        icon="tag"
        @click="$emit('tag', t.name)"
      />
    </div>
    <div class="tags" :class="{margins: lists.length > 0}">
      <Tag class="tag" v-for="l in lists" :key="l.id"
        :value="l.name"
        :selected='activeList === l.name'
        icon="tasks"
        @click="$emit('list', l.name)"
      />
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'
import TagVue from './Tag.vue'

import { mapState } from 'vuex'

export default {
  props: ['viewName', 'viewNameValue', 'options', 'tags', 'lists', 'activeTags', 'activeList', 'icon'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  created() {
    this.pushToNavbar()
  },
  methods: {
    click(event) {
      if (this.selectedTasks.length > 0) event.stopPropagation()
    },
    pushToNavbar() {
      this.$store.commit('pushNavBarData', {
        options: this.options,
        title: this.viewNameValue,
      })
    }
  },
  computed: {
    ...mapState(['selectedTasks']),
    getIcon() {
      if (this.icon) return this.icon
      const obj = {
        Today: 'star',
        Tomorrow: 'sun',
        Inbox: 'inbox',
        Upcoming: 'calendar',
        Completed: 'circle-check',
      }
      return obj[this.viewName]
    },
    getIconColor() {
      const obj = {
        Today: 'var(--yellow)',
        Tomorrow: 'var(--orange)',
        Inbox: 'var(--primary)',
        Upcoming: 'var(--green)',
        Completed: 'var(--brown)',
      }
      return obj[this.viewName]
    }
  },
  watch: {
    viewName() {
      this.pushToNavbar()
    },
    options() {
      this.pushToNavbar()
    },
  }
}

</script>

<style scoped>

.header, .tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin: 0;
  transition-duration: .2s;
}

.tag {
  margin-top: 4px;
}

.margins {
  margin-top: 30px;
}

.margins + .margins {
  margin-top: 4px;
}

.IconDrop {
  position: absolute;
  right: 0;
}

.icon {
  margin-right: 16px;
}

.name {
  margin: 0;
}

</style>
