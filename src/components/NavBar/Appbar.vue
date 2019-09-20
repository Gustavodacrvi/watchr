<template>
  <div class="Appbar">
    <div v-for="l in links"
      :key="l.name"
      class="link-wrapper rb"
      @click="l.callback"
    >
      <div class="icon-wrapper">
        <Icon class="icon" :icon="l.icon"/>
      </div>
      <div class="name-wrapper">
        <span class="name">{{ l.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

export default {
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      links: [
        {
          name: 'Today',
          icon: 'star',
          callback: () => console.log('today')
        },
        {
          name: 'Tomorrow',
          icon: 'sun',
          callback: () => console.log('tomorrow')
        },
        {
          name: 'Inbox',
          icon: 'inbox',
          callback: () => console.log('inbox')
        },
        {
          name: 'Upcoming',
          icon: 'calendar',
          callback: () => console.log('calendar')
        },
      ]
    }
  }
}

</script>

<style scoped>

.link-wrapper {
  height: 35px;
  cursor: pointer;
  transition: background-color .2s;
  position: relative;
  display: flex;
}

.link-wrapper:hover {
  background-color: var(--light-gray);
}

.icon-wrapper {
  height: 100%;
  width: 40px;
  position: relative;
}

.name-wrapper {
  height: 100%;
  display: inline-flex;
  align-items: center;
}

.icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

</style>
