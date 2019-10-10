<template>
  <div class="Illustration">
    <div class="center">
      <component :style="{width: getWidth}" class="illustration illustration-colors" :is="name"/>
    </div>
    <div v-if="title" class="center margin"><span>{{ title }}</span></div>
    <div v-if="descr" class="center margin fade"><span>{{ descr }}</span></div>
  </div>
</template>

<script>

import HappyFace from './HappyFace.vue'
import Sleep from './Sleep.vue'
import Error from './Error.vue'
import Logo from './Logo.vue'
import SadTag from './SadTag.vue'
import EmptyInbox from './EmptyInbox.vue'
import EmptyCalendar from './EmptyCalendar.vue'
import CleanCheck from './CleanCheck.vue'
import MultipleTags from './States/MultipleTags.vue'
import List from './States/List.vue'
import EmptyList from './States/EmptyList.vue'

export default {
  props: ['name', 'title', 'descr', 'width'],
  components: {
    HappyFace, Sleep, Error, Logo, SadTag,
    EmptyInbox, EmptyCalendar, CleanCheck,
    MultipleTags, List, EmptyList,
  },
  computed: {
    getWidth() {
      return this.width ? this.width : '125px'
    },
  }
}

</script>

<style scoped>

.Illustration {
  display: inline-block;
}

.center {
  display: flex;
  justify-content: center;
}

.margin {
  margin-top: 18px;
}

.fade {
  color: var(--gray);
}

</style>
