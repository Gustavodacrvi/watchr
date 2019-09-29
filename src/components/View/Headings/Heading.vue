<template>
  <div class="Heading">
    <div class="header-wrapper"
      @click="showing = !showing"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
    >
      <div class="header">
        <h4 class="name" :style="{color}">{{ name }}</h4>
        <IconDrop v-show="showIconDrop && options && options.length > 0" class="drop"
          handle='settings-h'
          :options='options'
        />
      </div>
    </div>
    <transition name="fade">
      <div v-show="showing" class="cont">
          <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script>

import IconDropVue from '../../IconDrop.vue'

export default {
  props: ['name', 'options', 'color'],
  components: {
    IconDrop: IconDropVue,
  },
  data() {
    return {
      showing: true,
      onHover: false,
    }
  },
  computed: {
    showIconDrop() {
      const isDesktop = this.$store.getters.isDesktop
      if (isDesktop && this.onHover) return true
      else if (!isDesktop) return true
      return false
    },
  }
}

</script>

<style scoped>

.Heading {
  margin: 24px 0;
  position: relative;
}

.header-wrapper {
  border-bottom: 1px solid var(--light-gray);
  padding: 0 6px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  height: 45px;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.name {
  margin: 0;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transition-duration: .2s;
}

.fade-leave, .fade-enter-to {
  opacity: 1;
  transition-duration: .2s;
}

</style>
