
<template>
  <div class="Folder">
    <div class="header cursor handle"
      @click="showing = !showing"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"
    >
      <span class="icon-wrapper">
        <Icon class="icon" icon="folder"/>
      </span>
      <span class="name"><b>{{ name }}</b></span>
      <transition name="fade-t">
        <Icon v-if="!showing || headerHover" class="arrow" :class="{showing}" icon="tiny-arrow" width="25px"/>
      </transition>
    </div>
    <div class="content">

    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

export default {
  props: ['name', 'id'],
  components: {
    Icon,
  },
  data() {
    return {
      showing: false,
      headerHover: false,
    }
  },
}

</script>

<style scoped>

.Folder {
  margin: 16px 0;
}

.header {
  position: relative;
  display: flex;
  height: 35px;
  font-size: 1.05em;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 100%;
}

.name {
  display: flex;
  align-items: center;
  transform: translateY(-2px);
}

.arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

</style>
