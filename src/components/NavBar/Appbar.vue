<template>
  <div class="Appbar">
    <AppbarElement v-for="l in links" :key="l.name"
      :name='l.name'
      :icon='l.icon'
      :callback='l.callback'
      :icon-color='l.iconColor'
    />
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
      ]
    }
  }
}

</script>

<style scoped>


</style>
