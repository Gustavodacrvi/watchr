<template>
  <div
    class="icon"
    :class="{primaryHover}"
    :style="{width: getWidth, color}"
    @click="$emit('click')"
  >
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
import userPlus from '@/assets/icons/user-plus.svg'
import out from '@/assets/icons/out.svg'
import arrow from '@/assets/icons/arrow.svg'
import settingsH from '@/assets/icons/settings-h.svg'
import settingsV from '@/assets/icons/settings-v.svg'
import sort from '@/assets/icons/sort.svg'
import tag from '@/assets/icons/tag.svg'
import completed from '@/assets/icons/completed.svg'
import sortName from '@/assets/icons/sort-name.svg'
import priority from '@/assets/icons/priority.svg'

export default {
  props: ['icon', 'width', 'primaryHover', 'color'],
  data() {
    return {
      icons: {
        inbox, calendar, sun, arrow, star, user, out,
        sort, tag, completed, priority,
        "user-plus": userPlus,
        "settings-h": settingsH,
        "sort-name": sortName,
        "settings-v": settingsV,
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

.icon {
  display: inline-block;
}

.primaryHover:hover {
  color: var(--primary) !important;
}

</style>
