<template>
  <div :class='`sort-appnavdivision-${this.group}`'>
    <transition-group name='fade'>
      <app-division v-for='el of list' :key='el.id'
        :name='el.name'
        :list='true'
        :icons='icons'
        :icons-payload='el.id'

        :data-vid='el.id'
      >
        <list-renderer
          group='appnavprojects'
          route='project'
          :list='el.list'
          :parent='el.id'
          :active='active'
          :name='el.name'
          @move='move'
        />
      </app-division>
    </transition-group>
  </div>
</template>

<script lang='ts'>

import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import Mixin from '@/mixins/sortable'

import Sortable from 'sortablejs'

import AppnavDivision from '@/components/TheAppBar/AppnavComponents/AppnavDivision.vue'
import ListRenderer from '@/components/TheAppBar/AppnavComponents/ListRenderer.vue'

import { ListIcon, AppnavDivisionEl } from '../../../interfaces/app'
import { IndexGetters } from '../../../interfaces/store/index'

@Component({
  components: {
    'app-division': AppnavDivision,
    'list-renderer': ListRenderer,
  },
})
export default class ListAppnavDivisionRendrer extends Mixins(Mixin) {
  @Getter isDesktop!: IndexGetters.IsDesktop

  @Prop(Array) icons!: ListIcon[]
  @Prop({required: true, type: Array}) list!: AppnavDivisionEl[]
  @Prop({required: true, type: String}) group!: string
  @Prop({required: true, type: String}) active!: string
  @Prop({default: false, type: Boolean}) disabled!: boolean
  @Prop({default: () => [], type: Function}) options!: (obj: any) => ListIcon[]
  @Prop({default: () => [], type: Function}) helpIcons!: (obj: any) => ListIcon[]

  sortable: any = null
  rootSelector: string = `.sort-appnavdivision-${this.group}`

  mounted() {
    this.mount()
  }

  mount() {
    const options: any = {
      disabled: this.disabled,
      animation: 150,
      selectedClass: 'sortable-selected',
      multiDrag: false,
      handle: '.division-handle',
      dataIdAttr: 'data-sortableid',
      group: this.group,

      onUpdate: () => {
        const ids: string[] = this.getIdsFromElements(this.rootSelector)
        this.$emit('update', ids)
      },
    }

    this.sortable = new Sortable(this.rootComponent, options)
  }
  move(obj: any) {
    this.$emit('move', obj)
  }

  get rootComponent(): HTMLElement {
    const root: HTMLElement = this.$el as HTMLElement
    return root.childNodes[0] as HTMLElement
  }
}

</script>
