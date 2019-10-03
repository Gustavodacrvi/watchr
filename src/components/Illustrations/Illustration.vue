<template>
  <div class="Illustration">
    <div class="center">
      <component :style="{width: getWidth}" class="illustration" :is="name"/>
    </div>
    <div class="center margin"><span>{{ title }}</span></div>
    <div class="center margin fade"><span>{{ descr }}</span></div>
  </div>
</template>

<script>

import HappyFace from './HappyFace.vue'

export default {
  props: ['name', 'title', 'descr', 'width'],
  components: {
    HappyFace,
  },
  computed: {
    getWidth() {
      return this.width ? this.width : '125px'
    }
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

.margin + .margin {
  margin-top: 10px;
}

.fade {
  color: var(--gray);
}

</style>
