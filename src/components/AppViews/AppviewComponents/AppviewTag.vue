<template>
  <div class='tag' @click='click' :style='{backgroundColor: backColor}'>
    <div class='icon'>
      <i :class='`fas fa-${icon} fa-sm`' :style="{color: 'white'}"></i>
    </div>
    <div class='name-wrapper'>
      <span class='name' :class="{'not-fixed': !fixed}">{{ name }}</span>
    </div>
    <div class='icon' v-if='fixed'>
      <i class='fas fa-thumbtack fa-sm' :style="{color: 'white'}"></i>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class AppviewIcon extends Vue {
  @Prop(String) backColor!: string
  @Prop(String) name!: string
  @Prop(String) icon!: string
  @Prop(Boolean) fixed!: boolean

  click() {
    if (!this.fixed)
      this.$emit('click', {name: this.name, icon: this.icon})
  }
}

</script>

<style scoped>

.tag {
  position: relative;
  display: inline-block;
  height: 25px;
  border-radius: 100px;
  transition: transform .2s;
  margin-top: 4px;
}

.tag:hover {
  cursor: pointer;
  transform: scale(1.05, 1.05);
}

.icon {
  width: 30px;
  justify-content: center;
}

.name-wrapper {
  color: white;
  display: inline-block;
}

.icon {
  color: white;
  display: inline-flex;
  height: 100%;
  align-items: center;
}

.name {
  position: relative;
  bottom: 1.5px;
}

.not-fixed {
  margin-right: 10px;
}

</style>
