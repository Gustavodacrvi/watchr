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

export default {
  props: ['name', 'title', 'descr', 'width'],
  components: {
    HappyFace, Sleep, Error, Logo,
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
