<template>
  <div>
    <transition-group name='fade'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :level='level + 1'
        :object-title-property-name='objectTitlePropertyName'
        :object-sublist-property-name='objectSublistPropertyName'
        :obj='obj'
        :sublist='getSublist(obj[objectSublistPropertyName])'
        :get-sublist='getSublist'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop } from 'vue-property-decorator'

import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import { MultiDrag } from 'sortablejs'

Sortable.mount(new AutoScroll(), new MultiDrag())

@Component({
  components: {
    'list-element': () => import('@/components/TheAppBar/AppnavComponents/ListElement.vue')
  },
})
export default class ListRenderer extends Vue {
  @Prop() list!: any[]
  @Prop({default: 0, type: Number}) level!: number
  @Prop({default: null}) parentId!: string | null
  @Prop(String) objectTitlePropertyName!: string
  @Prop(String) objectSublistPropertyName!: string
  @Prop(Function) getSublist!: (ids: string[]) => any[]

  mounted() {
    console.log(this.getRootComponent(), this.getRootComponent().children)
    const sortable = new Sortable(this.getRootComponent(), {
      animation: 150,
    })
  }

  getRootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    console.log(root)
    return root.childNodes[0] as HTMLElement
  }
}

</script>

<style scoped>

</style>
