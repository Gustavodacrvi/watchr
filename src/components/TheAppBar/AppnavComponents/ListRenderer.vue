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

        :data-vparentId='parentId'
        :data-vid='obj.id'
        :data-vlevel='level'

        @listtolist='listtolist'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const appnav = namespace('appnav')

import Sortable, { MultiDrag } from 'sortablejs'
import { AutoScroll } from 'sortablejs/modular/sortable.core.esm.js'

Sortable.mount(new MultiDrag(), new AutoScroll())

import { List } from '../../../interfaces/app'

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

  sortable: any = null

  mounted() {
    this.mount()
  }

  mount() {
    console.log(3)
    if (this.sortable)
      this.sortable.destroy()
    this.sortable = new Sortable(this.rootComponent, {
      disabled: false,
      animation: 150,
      group: this.group,
      selectedClass: 'sortable-selected',
      multiDrag: true,
      dataIdAttr: 'data-sortableid',

      onAdd: (d: any) => {
        console.log(d)
        const el: HTMLElement = d.item
        this.$emit('listtolist', {
          newList: {
            level: this.level,
            parentId: this.parentId,
          }, oldList: {
            level: parseInt(el.dataset.vlevel as any),
            parentId: el.dataset.vparentId as any,
            elementId: el.dataset.vid as any,
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
}

</script>

<style scoped>

.sortable-selected {
  background-color: red;
}

</style>
