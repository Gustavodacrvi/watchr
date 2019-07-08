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
      <div class='right'>
        <drop-finder
          class='icon pointer txt'
          handle='tags'
          size='lg'
          min-width='300px'
          :list='labelList'
        />
      </div>
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
import DropdownFinder from '@/components/AppViews/AppviewComponents/DropdownFinder.vue'

import { SmartPerspective, Label } from '../../interfaces/app'

const labelVuex = namespace('label')

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
    'view-tag': Tag,
    'drop-finder': DropdownFinder,
  },
})
export default class PerspectiveAppview extends Vue {
  @State('perspectiveData') pers!: SmartPerspective
  @Getter isDesktop!: boolean

  @labelVuex.Getter sortedLabels!: Label[]
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
  get labelList(): string[] {
    return this.sortedLabels.map(el => el.name)
  }
}

</script>

<style scoped>

.component {
  padding-top: 20px;
}

.header {
  position: relative;
}

.right {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
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
