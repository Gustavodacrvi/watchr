<template>
  <div class='element'>
    <div class='content'>
      <span class='txt'>{{ name }}</span>
      <div class='icons'>
        
      </div>
    </div>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'

import FontAwesome from '@/components/DynamicFontawesome.vue'
import { List } from '../../../interfaces/app';

@Component({
  components: {
    'dynamic-ft-icon': FontAwesome,
    'list-render': () => import('@/components/TheAppBar/AppnavComponents/ListRenderer.vue'),
  },
})
export default class ListRenderer extends Vue {
  @Prop(String) name!: string

  showing: boolean = true
}

</script>

<style scoped>

.element {
  position: relative;
}

.drop {
  margin-left: 12px;
}

</style>
