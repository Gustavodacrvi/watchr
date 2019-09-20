<template>
  <div class="Header">
    <Icon v-if="smart" class="icon" :icon="getIcon" :color="getIconColor" width="40px"/>
    <h2 class="name">{{ value }}</h2>
    <IconDrop handle="settings-h" handle-color="var(--gray)" :options="options"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'
import IconDropVue from '../IconDrop.vue'

export default {
  props: ['smart', 'value', 'options'],
  components: {
    Icon: IconVue,
    IconDrop: IconDropVue,
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
}

</script>

<style scoped>

.Header {
  display: flex;
  align-items: center;
  position: relative;
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
