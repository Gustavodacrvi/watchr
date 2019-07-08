<template>
  <div class='component'>
    <div class='header'>
      <dynamic-ft-icon
        :icon='pers.icon'
        :style='{color: pers.iconColor}'
        size='2x'
      />
      <span class='title'>
        {{ pers.name }}
      </span>
    </div>
    <p class='description txt'>
      {{ pers.description }}
    </p>
    <div class='tags'>
      <transition-group name='fade'>
        <view-tag v-for='tag in getLabels'
          :key='tag.name'
          :name='tag.name'
          :fixed='tag.fixed'
          icon='tag'
        />
      </transition-group>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'
import Tag from '@/components/AppViews/AppviewComponents/AppviewIcon.vue'

import { SmartPerspective, Label } from '../../interfaces/app'

const labelVuex = namespace('label')

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'view-tag': Tag,
  },
})
export default class PerspectiveAppview extends Vue {
  @State('perspectiveData') pers!: SmartPerspective
  @Getter isDesktop!: boolean

  @labelVuex.Getter getLabelsByIds!: (ids: string[]) => Label[]

  labels: string[] = []

  get getLabels(): Label[] {
    const labels: any[] = this.getLabelsByIds(this.labels)
    if (this.pers.name === 'Inbox')
      labels.push({
        name: 'Inbox',
        fixed: true,
      })
    return labels
  }
}

</script>

<style scoped>

.component {
  padding-top: 20px;
}

.header {
  display: flex;
  align-items: center;
}

.description {
  margin: 30px 0;
}

.tags {
  margin-bottom: 30px;
}

.title {
  font-size: 1.5em;
  margin-left: 12px;
  color: #FF6B66;
}

</style>
