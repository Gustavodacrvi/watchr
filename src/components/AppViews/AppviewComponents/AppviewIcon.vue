<template>
  <div class='tag' :class='style' @click="$emit('click', {name, icon})">
    <div class='icon'>
      <dynamic-ft-icon
        :icon='icon'
        size='sm'
        :style="{color: 'white'}"
      />
    </div>
    <div class='name-wrapper'>
      <span class='name'>{{ name }}</span>
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
  @Prop(String) name!: string
  @Prop(String) icon!: string

  get style() {
    if (this.icon === 'tag')
      return ['label']
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
  margin-right: 10px;
  bottom: 1.5px;
}

.label {
  background-color: #FF6B66;
}

</style>
