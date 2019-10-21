
<template>
  <div class="Subtask rb cursor" :class="{completed}">
    <span class="icons" @click="$emit('toggle')">
      <Icon v-if="!completed" class="icon" icon="circle"/>
      <Icon v-else class="icon" icon="circle-check"/>
    </span>
    <span class="name">{{ name }}</span>
    <div class="line-wrapper">
      <div class="line rb"></div>
    </div>
  </div>
</template>

<script>

import IconVue from '../../../Icon.vue'

export default {
  props: ['name', 'completed'],
  components: {
    Icon: IconVue,
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
