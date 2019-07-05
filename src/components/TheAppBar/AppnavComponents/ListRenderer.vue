<template>
  <div :class='`${group}-${level}`'>
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

        :data-vparentid='parentId'
        :data-vid='obj.id'
        :data-vlevel='level'
      />
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const list = namespace('list')

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

  @list.State getIds!: boolean
  @list.Mutation movedElement!: boolean
  @list.Mutation transfereElement!: (obj: {moves: {newList: List, oldList: List}[], movedList: string}) => void
  @list.Mutation saveIds!: (obj: {ids: string[], group: string}) => void

  sortable: any = null

  mounted() {
    this.mount()
  }

  mount() {
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
        const el: HTMLElement = d.item
        let items: HTMLElement[] = [el]
        if (d.items.length > 0)
          items = d.items
        const event: any[] = []
        for (const item of items)
          event.push({
              newList: {
              level: this.level,
              parentId: this.parentId,
            }, oldList: {
              level: parseInt(item.dataset.vlevel as any),
              parentId: item.dataset.vparentid as any,
              elementId: item.dataset.vid as any,
            },
          })
        this.transfereElement({
          moves: event,
          movedList: this.group,
        })
      },

      onSort: () => {
        this.getIdsFromElements()
      }
    })
  }

  getIdsFromElements() {
    if (this.level === 0) {
      const root = document.querySelector(`.${this.group}-${this.level}`)
      if (root) {
        const arr = Array.prototype.slice.call(root.querySelectorAll('[data-vid]'))
        const ids: string[] = []
        for (const el of arr)
          ids.push(el.dataset.vid)
        this.saveIds({
          ids,
          group: this.group,
        })
      }
    }
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }

  @Watch('getIds')
  onGetIds() {
    this.getIdsFromElements()
  }
}

</script>

<style scoped>

.sortable-selected {
  background-color: red;
}

</style>
