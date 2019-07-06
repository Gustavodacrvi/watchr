<template>
  <div class='element'>
    <div class='content'>
      <span class='txt'>{{ obj[objectTitlePropertyName] }}</span>
      <div class='icons'>
        
      </div>
    </div>
    <div v-if='showing' class='drop'>
      <list-render
        :level='level'
        :parent-id='obj.id'
        :group='group'
        :object-title-property-name='objectTitlePropertyName'
        :object-sublist-property-name='objectSublistPropertyName'
        :list='sublist'
        :get-sublist='getSublist'
        @update="$emit('update')"
        @push='push'
      />
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
  @Prop(Object) obj!: object
  @Prop({required: true, type: String}) group!: string
  @Prop({default: 0, type: Number}) level!: number
  @Prop(String) objectTitlePropertyName!: string
  @Prop(String) objectSublistPropertyName!: string
  @Prop(Array) sublist!: any[]
  @Prop(Function) getSublist!: (ids: string[]) => any[]

  showing: boolean = true

  errorCaptured() {
    console.log('list')
  }

  push(obj: any) {
    this.$emit('push', obj)
  }
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
