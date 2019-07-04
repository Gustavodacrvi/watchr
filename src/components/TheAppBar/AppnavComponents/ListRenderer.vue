<template>
  <div>
    <transition-group name='fade-fast'>
      <list-element v-for='obj in list'
        :key='obj.id'
        :group='group'
        :level='level + 1'
        :object-title-property-name='objectTitlePropertyName'
        :object-sublist-property-name='objectSublistPropertyName'
        :obj='obj'
        :sublist='getSublist(obj[objectSublistPropertyName])'
        :get-sublist='getSublist'

        :data-parentId='parentId'
        :data-id='obj.id'
        :data-level='level'

        @listtolist='listtolist'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const appnav = namespace('appnav')

import Sortable, { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'
import { MultiDrag } from 'sortablejs'
import { List } from '../../../interfaces/app';

Sortable.mount(new AutoScroll(), new MultiDrag())

@Component({
  components: {
    'list-element': () => import('@/components/TheAppBar/AppnavComponents/ListElement.vue')
  },
})
export default class ListRenderer extends Vue {
  @Prop({required: true, type: Array}) list!: any[]
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) objectTitlePropertyName!: string
  @Prop({required: true, type: String}) objectSublistPropertyName!: string
  @Prop({required: true, type: Function}) getSublist!: (ids: string[]) => any[]
  @Prop({default: 0, type: Number}) level!: number
  @Prop({default: null}) parentId!: string | null

  mounted() {
    this.mount()
  }

  mount() {
    const sortable = new Sortable(this.rootComponent, {
      animation: 150,
      group: this.group,

      onAdd: (d: any) => {
        const el: HTMLElement = d.item
        this.$emit('listtolist', {
          newList: {
            level: this.level,
            parentId: this.parentId,
          }, oldList: {
            level: parseInt(el.dataset.level as any),
            parentId: el.dataset.parentId as any,
            elementId: el.dataset.id as any,
          },
        })
      }
    })
  }

  listtolist(obj: {oldList: List, newList: List}) {
    this.$emit('listtolist', obj)
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }

  @Watch('list')
  onChange() {
    this.mount()
  }
}

</script>

<style scoped>

</style>
