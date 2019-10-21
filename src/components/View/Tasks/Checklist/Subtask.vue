
<template>
  <div class="Subtask rb cursor handle" :class="{completed}" @mouseenter="hover = true" @mouseleave="hover = false">
    <span class="icons" @click="$emit('toggle')">
      <Icon v-if="!completed" class="icon" icon="circle"/>
      <Icon v-else class="icon" icon="circle-check"/>
    </span>
    <span class="name">{{ name }}</span>
    <div class="line-wrapper">
      <div class="line rb"></div>
    </div>
    <transition name="fade-t">
      <div v-if="showDeleteIcon" class="delete-wrapper">
        <Icon icon="trash" class="delete" @click="$emit('remove')"/>
      </div>
    </transition>
  </div>
</template>

<script>

import IconVue from '../../../Icon.vue'

import { mapGetters } from 'vuex'

export default {
  props: ['name', 'completed', 'id'],
  components: {
    Icon: IconVue,
  },
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    ...mapGetters(['isDesktop']),
    showDeleteIcon() {
      return !this.isDesktop || this.hover
    }
  }
}
</script>

<style scoped>

.Subtask {
  position: relative;
  display: flex;
  transition-duration: .2s;
}

.line-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  height: 100%;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.line {
  width: 0;
  height: 3px;
  transition-duration: .3s;
  background-color: var(--extra-light-gray);
}

.completed .line {
  width: 100%;
}

.Subtask:hover {
  background-color: var(--light-gray);
}

.delete-wrapper {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  width: 30px;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.delete {
  transition-duration: .2s;
}

.delete:hover {
  color: var(--red);
}

.completed .icons, .completed .name {
  opacity: .2;
}

.icons {
  height: 100%;
  flex-basis: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity .2s;
}

.icon {
  transform: translateY(2px);
  margin-left: 6px;
}

.name {
  margin-left: 6px;
  height: 100%;
  display: flex;
  align-items: center;
  transition: opacity .2s;
  flex-basis: 100%;
}

</style>
