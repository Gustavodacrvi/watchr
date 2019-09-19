<template>
  <div class="icon" :style="{width: getWidth}" @click="$emit('click')">
    <svg :viewBox="getIcon.viewBox">
      <use :xlink:href="`#${getIcon.id}`"/>
    </svg>
  </div>
</template>

<script>

import inbox from '@/assets/icons/inbox.svg'
import calendar from '@/assets/icons/calendar.svg'
import sun from '@/assets/icons/sun.svg'
import star from '@/assets/icons/star.svg'
import user from '@/assets/icons/user.svg'

export default {
  props: ['icon', 'width'],
  data() {
    return {
      icons: {
        inbox, calendar, sun, star, user,
      }
    }
  },
  computed: {
    getIcon() {
      return this.icons[this.icon]
    },
    getWidth() {
      return this.width ? this.width : "20px"
    }
  }
}

</script>

<style scoped>

</style>
