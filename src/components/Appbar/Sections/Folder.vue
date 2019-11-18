
<template>
  <div class="Folder">
    <div class="header rb cursor handle-folder"
      @click="toggle"
      @mouseenter="headerHover = true"
      @mouseleave="headerHover = false"
    >
      <span class="icon-wrapper">
        <Icon class="icon" :class="{headerHover}" icon="folder"/>
      </span>
      <span class="name"><b>{{ name }}</b></span>
    </div>
    <div class="content">
      <div v-if="showing">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

export default {
  props: ['name', 'id', 'defaultShowing'],
  components: {
    Icon,
  },
  data() {
    return {
      showing: this.defaultShowing,
      headerHover: false,
    }
  },
  methods: {
    toggle() {
      this.showing = !this.showing
      this.$store.dispatch('folder/saveFolder', {
        id: this.id,
        defaultShowing: this.showing,
      })
    }
  }
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
  transition-duration: .2s;
}

.header:hover {
  background-color: var(--light-gray);
}

.icon {
  color: var(--gray);
  transform: translateY(2px);
  transition-duration: .2s;
}

.icon.headerHover {
  color: var(--white);
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
}

.arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

</style>
