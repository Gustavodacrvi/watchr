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
        :object-title-property-name='objectTitlePropertyName'
        :object-sublist-property-name='objectSublistPropertyName'
        :list='sublist'
        :get-sublist='getSublist'
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
    'list-render': () => import('@/components/TheAppBar/AppnavComponents/ListRenderer.vue'),
  },
})
export default class ListRenderer extends Vue {
  @Prop(Object) obj!: object
  @Prop({default: 0, type: Number}) level!: number
  @Prop(String) objectTitlePropertyName!: string
  @Prop(String) objectSublistPropertyName!: string
  @Prop(Array) sublist!: any[]
  @Prop(Function) getSublist!: (ids: string[]) => any[]

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
