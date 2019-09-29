<template>
  <div class="Header">
    <div v-if="$store.getters.isDesktop" class="header">
      <Icon v-if="useIcon" class="icon" :icon="getIcon" :color="getIconColor" width="40px"/>
      <h2 class="name">{{ value }}</h2>
      <IconDrop handle="settings-h" handleColor="var(--gray)" :options="options"/>
    </div>
    <div class="tags" :class="{margins: tags.length > 0}">
      <Tag v-for="t in tags" :key="t.id"
        :value="t.name"
        :selected='activeTags.includes(t.name)'
        icon="tag"
        @click="$emit('tag', t.name)"
      />
    </div>
    <div class="tags" :class="{margins: lists.length > 0}">
      <Tag v-for="l in lists" :key="l.id"
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

export default {
  props: ['useIcon', 'value', 'options', 'tags', 'lists', 'activeTags', 'activeList'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  created() {
    this.pushToNavbar()
  },
  methods: {
    pushToNavbar() {
      this.$store.commit('pushNavBarData', {
        options: this.options,
        title: this.value,
      })
    }
  },
  computed: {
    getIcon() {
      const obj = {
        Today: 'star',
        Tomorrow: 'sun',
        Inbox: 'inbox',
        Upcoming: 'calendar',
      }
      return obj[this.value]
    },
    getIconColor() {
      const obj = {
        Today: 'var(--yellow)',
        Tomorrow: 'var(--orange)',
        Inbox: 'var(--primary)',
        Upcoming: 'var(--green)',
      }
      return obj[this.value]
    }
  },
  watch: {
    value() {
      this.pushToNavbar()
    },
    options() {
      this.pushToNavbar()
    },
    useIcon() {
      this.pushToNavbar()
    },
  }
}

</script>

<style scoped>

.header, .tags {
  display: flex;
  align-items: center;
  position: relative;
  margin: 0;
  transition-duration: .2s;
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
