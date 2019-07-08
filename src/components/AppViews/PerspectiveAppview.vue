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
    {{getLabels}}
  </div>
</template>

<script lang='ts'>

import { Component, Vue } from 'vue-property-decorator'
import { State, Getter, namespace } from 'vuex-class'

import DynamicFontawesome from '@/components/DynamicFontawesome.vue'

import { SmartPerspective, Label } from '../../interfaces/app'

const labelVuex = namespace('label')

@Component({
  components: {
    'dynamic-ft-icon': DynamicFontawesome,
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
  margin: 25px 0;
}

.title {
  font-size: 1.5em;
  margin-left: 12px;
  color: #FF6B66;
}

</style>
