<template>
  <div class='tag' @click='click' :style='{backgroundColor: backColor}'>
    <div class='icon'>
      <dynamic-ft-icon
        :icon='icon'
        size='sm'
        :style="{color: 'white'}"
      />
    </div>
    <div class='name-wrapper'>
      <span class='name' :class="{'not-fixed': !fixed}">{{ name }}</span>
    </div>
    <div class='icon' v-if='fixed'>
      <dynamic-ft-icon
        icon='thumbtack'
        size='sm'
        :style="{color: 'white'}"
      />
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import FontAwesome from '@/components/DynamicFontawesome.vue'

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
  },
})
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
